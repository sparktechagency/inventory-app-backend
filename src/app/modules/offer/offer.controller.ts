import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";
import { sendOfferService } from "./offer.service";

// Create a new product Controller
const createOffer = catchAsync(async (req: Request, res: Response) => {
    const io = (global as any).io;
    const result = await sendOfferService.createOffer(req.body, io);
    // console.log("result:--->>>>>", result);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Order created and notification sent successfully",
        data: result.order,
    });
});




// update offer from wholesaler
const updateOffer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const io = (global as any).io;

    const result = await sendOfferService.updateOfferIntoDB(req.user, id, req.body, io);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Offer updated and notification sent successfully",
        data: result.updatedOffer,
    });
})


// Again update from retailer to wholesaler
const confirmOrderFromRetailer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const io = (global as any).io;

    const result = await sendOfferService.updateOfferFromRetailer(id, req.body, io);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Offer updated and notification sent successfully from retailer",
        data: result.updatedOffer,
    });
});


export const sendOfferController = {
    createOffer,
    updateOffer,
    confirmOrderFromRetailer
};
