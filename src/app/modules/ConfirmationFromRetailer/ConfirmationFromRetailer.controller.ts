
import sendResponse from "../../../shared/sendResponse";
import { confirmationFromRetailerService } from "./ConfirmationFromRetailer.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// update pending product as retailer
const updatePendingProductAsRetailer = async (req: Request, res: Response) => {
    const result = await confirmationFromRetailerService.updatePendingProductAsRetailerFromDB(req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Successfully updated pending product as retailer",
        data: result,
    });
}



const getAllConfrimRequestFromRetailer = async (req: Request, res: Response) => {
    const result = await confirmationFromRetailerService.getAllConfrimRequestFromRetailerIntoDB(req.user, req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Successfully fetched received offers",
        pagination: result.meta,
        data: result.data,
    });
}


const getAllConfirmRequestFromRetailerForRetailer = async (req: Request, res: Response) => {
    const result = await confirmationFromRetailerService.getAllConfirmRequerstFromRetailerIntoDBForRetailer(req.user, req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Successfully fetched received offers",
        pagination: result.meta,
        data: result.data,
    });
}


const testController = async (req: Request, res: Response) => {
    const result = await confirmationFromRetailerService.testFromDB(req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Successfully fetched received offers",
        data: result,
    });
}


export const confirmationFromRetailerController = {
    testController,
    updatePendingProductAsRetailer,
    getAllConfrimRequestFromRetailer,
    getAllConfirmRequestFromRetailerForRetailer
}