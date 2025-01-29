import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import { IUser } from "../user/user.interface";

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

// get all retailers from db
const getAllRetailers = async (search?: string) => {
    let query: any = { role: USER_ROLES.Retailer };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { businessName: { $regex: search, $options: "i" } }
        ]
    }

    const retailers = await User.find(query);
    if (!retailers || retailers.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No retailers found!');
    }

    return retailers;
}



// update Retailer details
const updateRetailerIntoDB = async (id: string, payload: Partial<IUser>): Promise<IUser | null> => {
    const updatedRetailer = await User.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (!updatedRetailer) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Retailer not found!');
    }
    return updatedRetailer;
};

// delete retailer from db
const deleteRetailerFromDB = async (id: string) => {
    const deletedRetailer = await User.findByIdAndDelete(id);
    if (!deletedRetailer) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Retailer not found!');
    }
    return deletedRetailer;
}


export const wholesalerServices = {
    //* for wholesaler service
    getAllWholeSaler,
    getWholeSalerById,

    //*  for retailer service
    getAllRetailers,
    updateRetailerIntoDB,
    deleteRetailerFromDB
}