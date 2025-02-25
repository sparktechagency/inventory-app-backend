import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import catchAsync from "../../../shared/catchAsync";
import { wholesalerServices } from "./wholesaler.service";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";

const getAllWholeSalers = catchAsync(async (req: Request, res: Response) => {
    const { search, email, name }: any = req.query;

    const result = await wholesalerServices.getAllWholeSaler({ search, email, name });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        Total: result.length,
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
// update wholesaler details
const updateSingleWholesaler = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const updatedRetailer = await wholesalerServices.updateRetailerIntoDB(id, payload);

    if (!updatedRetailer) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Retailer not found! Please provide a valid ID.');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        Total: updateSingleRetailer.length,
        message: 'Retailer updated successfully',
        data: updatedRetailer,
    });
});


//collection of retailer
const getAllRetailers = catchAsync(async (req: Request, res: Response) => {
    const search = req.query.search as string;
    // console.log("Search Parameter:", search);

    const result = await wholesalerServices.getAllRetailers(search);

    if (!result || result.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No retailers found!');
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        Total: result.length,
        message: "Retailers retrieved successfully",
        data: result,
    });
})



// update retailer details
const updateSingleRetailer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const updatedRetailer = await wholesalerServices.updateRetailerIntoDB(id, payload);

    if (!updatedRetailer) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Retailer not found! Please provide a valid ID.');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        Total: updateSingleRetailer.length,
        message: 'Retailer updated successfully',
        data: updatedRetailer,
    });
});

// retailer delete
const deleteSingleRetailer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedRetailer = await wholesalerServices.deleteRetailerFromDB(id);
    if (!deletedRetailer) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Retailer not found! Please provide a valid ID.');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Retailer deleted successfully',
        data: null,
    });
})

// 
export const wholesalerController = {
    // * all wholesaler controller
    getAllWholeSalers,
    getWholeSalerById,
    // deleteSingleWholesaler,
    updateSingleWholesaler,


    // * all retailer controller
    getAllRetailers,
    updateSingleRetailer,
    deleteSingleRetailer
}
