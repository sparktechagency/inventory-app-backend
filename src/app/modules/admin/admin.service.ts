import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import bcrypt from "bcrypt";
import { IUser } from "../user/user.interface";

const createUserIntoDB = async (payload: IUser) => {
    try {
        if (payload.password) {
            const saltRounds = 10;
            payload.password = await bcrypt.hash(payload.password, saltRounds);
        } else {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Password is required");
        }

        const result = await User.create(payload);

        if (!result) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
        }

        return result;
    } catch (error) {
        console.error("Error while creating user:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Database operation failed");
    }
}




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
