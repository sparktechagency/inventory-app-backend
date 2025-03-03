import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { packageService } from "./package.service";

const createPackage = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { ...productData } = req.body;
        const result = await packageService.createPackageIntoDB(productData);
        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Package Create successfully.',
            data: result,
        });
    }
);

// get all packages
const getAllPackages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const packages = await packageService.getAllPackages();
    if (!packages) {
        throw new Error("No packages found");
    }
    sendResponse(res, {
        success: true,
        Total: packages.length,
        statusCode: StatusCodes.OK,
        message: 'All packages',
        data: packages,
    })
})


// get single package
const getSinglePackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const packageData = await packageService.getSinglePackage(id);
    if (!packageData) {
        throw new Error("Package not found");
    }
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Package found',
        data: packageData,
    })
})

// export the function
export const packageController = {
    createPackage,
    getAllPackages,
    getSinglePackage
}