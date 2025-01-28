import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";

// get all wholesaler from db
const getAllWholeSaler = async (search?: string) => {
    // Build the search filter
    const filter: any = { role: USER_ROLES.Wholesaler };

    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    // Find wholesalers based on the filter
    const wholeSalerUsers = await User.find(filter);

    if (!wholeSalerUsers || wholeSalerUsers.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No wholesalers found!');
    }

    return wholeSalerUsers;
};

// get single wholesaler from db
const getWholeSalerById = async (id: string) => {
    const wholeSalerUser = await User.findById(id);
    if (!wholeSalerUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Wholesaler not found!');
    }
    return wholeSalerUser;
};




// 
export const wholesalerServices = {
    getAllWholeSaler,
    getWholeSalerById
}