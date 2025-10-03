import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const createUser = catchAsync(async (req: Request, res: Response) => {
    let { password, confirmPassword, Password, ...userData } = req.body;

    // Handle frontend using Password / password
    password = password || Password;
    confirmPassword = confirmPassword || req.body.confirmPassword;

    if (!password || !confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Password and Confirm Password are required",
        });
    }

    if (password !== confirmPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: "Password and Confirm Password do not match",
        });
    }

    // Map password to userData
    userData.password = password;
    userData.confirmPassword = confirmPassword;

    // Parse storeInformation if it’s a string
    if (userData.storeInformation && typeof userData.storeInformation === "string") {
        try {
            userData.storeInformation = JSON.parse(userData.storeInformation);
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid format for store information",
            });
        }
    }

    const user = await adminService.createUserIntoDB(userData);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "User created successfully by admin",
        data: user,
    });
});




const updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = req.body;

    // Optional: Validate if the user exists or if the data is valid before calling the service
    const user = await adminService.updateUserIntoDB(id, userData);
    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user
    });
});


// delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await adminService.deleteUserIntoDB(id);
    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: user
    });
});

export const adminController = {
    createUser,
    updateUser,
    deleteUser
}
