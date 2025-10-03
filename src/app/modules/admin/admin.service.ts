import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import bcrypt from "bcrypt";
import { IUser } from "../user/user.interface";

const createUserIntoDB = async (payload: Partial<IUser>): Promise<IUser> => {
    payload.verified = true;

    if (!payload.password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Password is required");
    }

    // Confirm password check
    if (payload.password !== payload.confirmPassword) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Password and Confirm Password do not match"
        );
    }

    const existingUser = await User.isExistUserByEmailOrPhone(payload.email!);
    if (existingUser) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "User already exists with this email or phone."
        );
    }

    try {
        // Hash password before saving
        const saltRounds = 12;
        payload.password = await bcrypt.hash(payload.password, saltRounds);

        const result = await User.create(payload);

        if (!result) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
        }

        return result;
    } catch (error: any) {
        if (error.code === 11000) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                "Duplicate email or phone found. Please use another one."
            );
        }
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create user");
    }
};





const updateUserIntoDB = async (id: string, payload: Partial<IUser>) => {
    try {
        const result = await User.findByIdAndUpdate(id, payload, { new: true });
        if (!result) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update user");
        }
        return result;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to update user");
    }
}


// delete user
const deleteUserIntoDB = async (id: string) => {
    try {
        const result = await User.findByIdAndDelete(id);
        return result;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete user");
    }
}





export const adminService = {
    createUserIntoDB,
    updateUserIntoDB,
    deleteUserIntoDB
}
