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




// export the function
export const packageService = {
    createPackageIntoDB
}