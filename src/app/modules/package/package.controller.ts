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
            data: {
                result
            },
        });
    }
);



// export the function
export const packageController = {
    createPackage
}