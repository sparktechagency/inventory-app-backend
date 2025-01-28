import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import catchAsync from "../../../shared/catchAsync";
import { wholesalerServices } from "./wholesaler.service";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";

const getAllWholeSalers = catchAsync(async (req: Request, res: Response) => {
    const result = await wholesalerServices.getAllWholeSaler();
    if (!result) {
        throw new ApiError(StatusCodes.OK, 'No products found!');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product retrieved successfully",
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

// 
export const wholesalerController = {
    getAllWholeSalers,
    getWholeSalerById,
}
