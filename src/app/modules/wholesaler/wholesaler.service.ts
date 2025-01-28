import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";

// get all wholesaler from db
const getAllWholeSaler = async (search?: string) => {
    const filter: any = { role: USER_ROLES.Wholesaler };

    // console.log("Search parameter received:", search);

    // Add search condition if `search` is provided
    if (search) {
        filter.businessName = { $regex: search, $options: 'i' };
    }

    // console.log("Generated Filter:", JSON.stringify(filter, null, 2));

    try {
        // Fetch wholesalers matching the filter
        const wholeSalerUsers = await User.find(filter);

        // console.log("Matched Wholesalers:", wholeSalerUsers);

        if (!wholeSalerUsers || wholeSalerUsers.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'No wholesalers found!');
        }

        return wholeSalerUsers;
    } catch (error) {
        console.error("Error fetching wholesalers:", error);
        throw error;
    }
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