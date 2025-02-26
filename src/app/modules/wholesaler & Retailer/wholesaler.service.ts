import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import { IUser } from "../user/user.interface";

// get all wholesaler from db
const getAllWholeSaler = async ({ search, email, name }: { search?: string, email?: string, name?: string }) => {
    const filter: any = { role: "Wholesaler" };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }

    if (email) {
        filter.email = { $regex: email, $options: "i" };
    }

    if (name) {
        filter.name = { $regex: name, $options: "i" };
    }


    return await User.find(filter);
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
// update Wholesaler details
const updateWholesalerIntoDB = async (id: string, payload: Partial<IUser>): Promise<IUser | null> => {
    const updatedWholesaler = await User.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    if (!updatedWholesaler) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Wholesaler not found!');
    }
    return updatedWholesaler;
};





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
    // deleteWholesalerFromDB,
    updateWholesalerIntoDB,
    //*  for retailer service
    getAllRetailers,
    updateRetailerIntoDB,
    deleteRetailerFromDB
}