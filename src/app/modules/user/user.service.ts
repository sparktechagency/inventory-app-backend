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
import { Twilio } from 'twilio';
import config from '../../../config';
import { formatPhoneNumber } from '../../../util/formatPhoneNumber';
import { twilioClient } from '../../../util/twilioClient';

// const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
//   // Create the user
//   const createUser = await User.create(payload);
//   if (!createUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
//   }

//   // Generate OTP
//   const otp = generateOTP();
//   const values = {
//     name: createUser.name,
//     otp: otp,
//     email: createUser.email!,
//   };

//   // Send OTP email
//   const createAccountTemplate = emailTemplate.createAccount(values);
//   emailHelper.sendEmail(createAccountTemplate);

//   // Save OTP and expiry to the DB
//   const authentication = {
//     oneTimeCode: otp,
//     expireAt: new Date(Date.now() + 3 * 60000),
//   };

//   const updatedUser = await User.findOneAndUpdate(
//     { _id: createUser._id },
//     { $set: { authentication } },
//     { new: true } // Ensure the updated document is returned
//   );

//   if (!updatedUser) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to save OTP');
//   }

//   return createUser;
// };
const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (!payload.email && !payload.phone) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Either email or phone is required.');
  }

  const existingUser = await User.isExistUserByEmailOrPhone(payload.email || payload.phone || '');
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


const verifyOtp = async (email: string, otp: number): Promise<boolean> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (!user.authentication || !user.authentication.oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP not generated!");
  }

  if (new Date() > user.authentication.expireAt) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "OTP has expired!");
  }

  if (Number(user.authentication.oneTimeCode) !== Number(otp)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP!");
  }

  user.verified = true;
  user.authentication = undefined;
  await user.save();

  return true;
};




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

  let otpDeliveryMethod: string;

  // Check if user has phone number, send OTP via phone (Twilio) or email
  if (user.phone) {
    otpDeliveryMethod = 'phone';

    // Send OTP via Twilio (Phone)
    const formattedNumber = formatPhoneNumber(user.phone);
    const otpMessage = `Your OTP is ${otp}`;

    try {
      await twilioClient.messages.create({
        body: otpMessage,
        from: process.env.TWILIO_PHONE_NUMBER, // Make sure to use the correct Twilio number
        to: formattedNumber,
      });
      console.log("Twilio Response: OTP sent to phone number.");
    } catch (twilioError) {
      console.error("Twilio API Error:", twilioError);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send OTP to phone number.");
    }

  } else if (user.email) {
    otpDeliveryMethod = 'email';

    // Send OTP via email
    const values = {
      name: user.name,
      otp: otp,
      email: user.email,
    };

    const otpTemplate = emailTemplate.createAccount(values);
    try {
      emailHelper.sendEmail(otpTemplate);
      console.log("OTP sent to email:", user.email);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send OTP via email.");
    }
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No valid contact method (phone or email) found.');
  }

  // Save OTP in DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000), // 3 minutes expiry
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



export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  verifyOtp,
  updateStoreData
};