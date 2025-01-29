import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import catchAsync from "../../../shared/catchAsync";
import { wholesalerServices } from "./wholesaler.service";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";

const getAllWholeSalers = catchAsync(async (req: Request, res: Response) => {
    const search = req.query.search as string;
    // console.log("Query Parameter - Search:", search);

    // Pass the search parameter to the service
    const result = await wholesalerServices.getAllWholeSaler(search);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Wholesalers retrieved successfully",
        data: result,
    });
});

// get single wholesaler
const getWholeSalerById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Fetch wholesaler by ID from service
    const result = await wholesalerServices.getWholeSalerById(id);

    // Send response
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Wholesaler retrieved successfully",
        data: result,
    });
});


//collection of retailer
const getAllRetailers = catchAsync(async (req: Request, res: Response) => {
    const search = req.query.search as string;
    const result = await wholesalerServices.getAllRetailers(search);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        Total: result.length,
        message: "Retailers retrieved successfully",
        data: result,
    });
})


// 
export const wholesalerController = {
    getAllWholeSalers,
    getWholeSalerById,
    getAllRetailers
}
