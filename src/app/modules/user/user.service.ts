import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { BUSINESS_CATEGORY, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { formatPhoneNumber } from '../../../util/formatPhoneNumber';



const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (!payload.email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Either email or phone is required.');
  }

  const existingUser = await User.isExistUserByEmailOrPhone(payload.email);
  if (existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User already exists with this email or phone.');
  }

  try {
    const createUser = await User.create(payload);
    return createUser;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User already exists with this email or phone.');
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};



const snsClient = new SNSClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});


const updateStoreData = async (
  userId: string,
  storeData: {
    businessName: string;
    businessCategory: string;
    location: string;
  }
): Promise<IUser | null> => {
  // Generate OTP
  const otp = generateOTP();

  // Get user info
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  let otpDeliveryMethod: string = 'email';

  // Send OTP via email
  if (user.email) {
    // Prepare values for email
    const values = {
      name: user.name,
      otp: otp,
      email: user.email,
    };

    const otpTemplate = emailTemplate.createAccount(values);
    try {
      // Send the OTP email
      emailHelper.sendEmail(otpTemplate);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send OTP via email.");
    }
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No valid contact method (email) found.');
  }

  // Save OTP in DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  const result = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        storeInformation: storeData,
        authentication,
      },
    },
    { new: true }
  );
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result;
};


const verifyOtp = async (identifier: string, otp: number): Promise<boolean> => {
  // Check if the identifier is email or phone
  const isEmail = identifier.includes('@'); // Basic check for email

  let user;

  if (isEmail) {
    // If it's an email, search by email
    user = await User.findOne({ email: identifier });
  } else {
    // If it's a phone number, search by phone number
    user = await User.findOne({ phone: identifier });
  }

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (!user.authentication || !user.authentication.oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP not generated!");
  }

  // Define grace period (e.g., 5 seconds)
  const gracePeriod = 5000; // 5 seconds

  // Convert expireAt and current time to timestamps
  const otpExpiryTime = new Date(user.authentication.expireAt).getTime();
  const currentTime = new Date().getTime();


  // Check if the OTP is expired with grace period
  if (currentTime > otpExpiryTime + gracePeriod) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP has expired!");
  }

  // Validate OTP
  if (Number(user.authentication.oneTimeCode) !== Number(otp)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP!");
  }

  // Mark the user as verified and clear the OTP from the database
  user.verified = true;
  user.authentication = undefined; // Clear the OTP
  await user.save();

  return true;
};




export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  verifyOtp,
  updateStoreData
};