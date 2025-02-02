import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { createSubscriptionProductHelper } from "../../../helpers/createSubscriptionProductHelper";
import { IPackage } from "./package.interface";
import { Package } from "./package.model";


// create a new package
const createPackageIntoDB = async (payload: IPackage) => {

    const productPayload = {
        name: payload.name,
        description: payload.description,
        duration: payload.duration,
        price: payload.price
    }

    const product = await createSubscriptionProductHelper(productPayload);
    if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create subscription product")
    }

    if (product) {
        product.productId = product.productId;
        product.paymentLink = product.paymentLink
    }


    const createPackage = await Package.create(payload);

    if (!createPackage) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Package not created");
    }
    console.log("createPackage---------->>>>>>", createPackage);
    return createPackage;
}

// get all packages
const getAllPackages = async () => {
    const packages = await Package.find();
    if (!packages) {
        throw new Error("No packages found");
    }
    return packages;
}


// get single package
const getSinglePackage = async (id: string) => {
    const result = await Package.findById(id);
    if (!result) {
        throw new Error("Package not found");
    }
    return result;
}

// export the function
export const packageService = {
    createPackageIntoDB,
    getAllPackages,
    getSinglePackage
}