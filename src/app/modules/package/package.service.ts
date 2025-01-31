import { IPackage } from "./package.interface";
import { Package } from "./package.model";


// create a new package
const createPackageIntoDB = async (payload: IPackage) => {
    const createPackage = await Package.create(payload);

    if (!createPackage) {
        throw new Error("Package not created");
    }

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