import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";
import { BUSINESS_CATEGORY, USER_ROLES } from "../../../enums/user";
import ApiError from "../../../errors/ApiError";
import { emailHelper } from "../../../helpers/emailHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import unlinkFile from "../../../shared/unlinkFile";
import generateOTP from "../../../util/generateOTP";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { formatPhoneNumber } from "../../../util/formatPhoneNumber";
import { IVerifyEmail } from "../../../types/auth";
import config from "../../../config";
import { ResetToken } from "../resetToken/resetToken.model";
import cryptoToken from "../../../util/cryptoToken";
import { jwtHelper } from "../../../helpers/jwtHelper";

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (!payload.email) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Either email or phone is required."
    );
  }

  const existingUser = await User.isExistUserByEmailOrPhone(payload.email);
  if (existingUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User already exists with this email or phone."
    );
  }

  try {
    const createUser = await User.create(payload);
    return createUser;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "User already exists with this email or phone."
      );
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
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
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const id = user?.authId || user?.id;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Unlink file here
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
  const otp = generateOTP();

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  let otpDeliveryMethod: string = "email";

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
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to send OTP via email."
      );
    }
  } else {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No valid contact method (email) found."
    );
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
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return result;
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select("+authentication");
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please give the OTP, check your email"
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You provided wrong OTP");
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "OTP already expired, Please try again"
    );
  }

  let message;
  let data;

  if (!isExistUser.verified) {
    // ✅ Mark verified
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        verified: true,
        authentication: { oneTimeCode: null, expireAt: null },
      }
    );

    // ✅ Token generate
    const accessToken = jwtHelper.createToken(
      { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
      config.jwt.jwt_secret as Secret,
      config.jwt.jwt_expire_in as string
    );

    message = "Email verified successfully";
    data = { accessToken };
  } else {
    // ✅ Already verified → Reset password flow
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      }
    );

    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });

    message =
      "Verification Successful: Please securely store and utilize this code for password reset";
    data = createToken;
  }

  return { data, message };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  verifyEmailToDB,
  updateStoreData,
};
