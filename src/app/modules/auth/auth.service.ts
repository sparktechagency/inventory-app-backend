import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiError";
import { emailHelper } from "../../../helpers/emailHelper";
import { jwtHelper } from "../../../helpers/jwtHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from "../../../types/auth";
import cryptoToken from "../../../util/cryptoToken";
import generateOTP from "../../../util/generateOTP";
import { ResetToken } from "../resetToken/resetToken.model";
import { User } from "../user/user.model";

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, phone, password, otp } = payload;

  // Check if user exists with email or phone number (preferably one of them is provided)
  let isExistUser;
  if (email) {
    isExistUser = await User.findOne({ email }).select("+password");
  }

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Check user status (e.g., deleted or disabled accounts)
  if (isExistUser.status === "delete") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You don’t have permission to access this content. It looks like your account has been deactivated."
    );
  }

  /* // If user is not verified and OTP is provided, verify OTP
  if (!isExistUser.verified) {
    // If OTP is not provided, throw an error
    if (!otp) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Please verify your account using OTP.');
    }

    // Verify OTP
    const otpVerified = await verifyOtp(isExistUser.email || isExistUser.phone, otp);
    if (!otpVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP!');
    }

    // After successful OTP verification, mark the user as verified
    isExistUser.verified = true;
    await isExistUser.save();
  } */

  // If the user is verified, check the password
  if (password) {
    // Check match password
    if (!(await User.isMatchPassword(password, isExistUser.password))) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Password is incorrect!");
    }
  }

  // Create token after verifying the password or OTP
  const createToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return {
    createToken,
    role: isExistUser.role,
    userId: isExistUser._id,
    email: isExistUser.email,
  };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmailOrPhone(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
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
      "Please give the otp, check your email we send a code"
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You provided wrong otp");
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Otp already expired, Please try again"
    );
  }

  let message;
  let data;

  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
    );
    message = "Email verify successfully";
  } else {
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

    //create token ;
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      "Verification Successful: Please securely store and utilize this code for reset password";
    data = createToken;
  }
  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    "+authentication"
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Token expired, Please click again to the forget password"
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select("+password");
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is incorrect");
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please give different password from current password"
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
};
