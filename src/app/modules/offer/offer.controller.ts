import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";
import { sendOfferService } from "./offer.service";

// Create a new product Controller
const createOfferController = catchAsync(async (req: Request, res: Response) => {
    try {

        const io = (global as any).io;
        if (!io) {
            console.error("Socket.IO instance is missing");
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Socket.IO is not initialized");
        }

        const result = await sendOfferService.createOffers(req.body, io);


        sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: `Successfully created ${result.orders.length} orders and sent notifications`,
            data: result.orders,
        });

    } catch (error) {
        console.error("Error in createOfferController:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create orders");
    }
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
    createOfferController,
    updateOffer,
    confirmOrderFromRetailer
};
