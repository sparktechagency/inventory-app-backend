import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { adminService } from "./admin.service";
import { StatusCodes } from "http-status-codes";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const { Password, confirmPassword, image, isVerified, ...userData } = req.body;

    const verified = true;
    // Check if password and confirmPassword exist
    if (!Password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password and Confirm Password are required"
        });
    }

    // Ensure password and confirmPassword match
    if (Password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match"
        });
    }

    // Parse storeInformation if it’s a string
    if (userData.storeInformation) {
        if (typeof userData.storeInformation === 'string') {
            try {
                userData.storeInformation = JSON.parse(userData.storeInformation);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid format for store information"
                });
            }
        } else {
        }
    } else {
        console.log('storeInformation is not provided in the request');
    }

    // Log the final payload being sent to the service
    const payload = { ...userData, password: Password, image: image || null, verified };

    // Proceed to create the user
    const user = await adminService.createUserIntoDB(payload);

    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user
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
