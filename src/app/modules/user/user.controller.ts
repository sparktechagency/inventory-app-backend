import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { IUser } from './user.interface';

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'User created successfully please check your email for verification code.',
      data: result,
    });
  }
);

const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let image = getSingleFilePath(req.files, 'image');

    const data = {
      image,
      ...req.body,
    };
    const result = await UserService.updateProfileToDB(user, data);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Profile updated successfully',
      data: result,
    });
  }
);


// otp verification in controller
const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const result = await UserService.verifyOtp(email, otp);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "OTP verified successfully",
    data: result,
  });
});


//update store information

const updateStoreInformation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const storeData = req.body;

    const result = await UserService.updateStoreData(userId, storeData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Store information updated successfully. Please check your email for OTP verification.',
      data: result,
    });
  }
);






export const UserController = {
  createUser, getUserProfile, updateProfile, verifyOtp,
  updateStoreInformation
};
