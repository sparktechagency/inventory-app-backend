import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";
import { sendOfferService } from "./offer.service";
import { JwtPayload } from "jsonwebtoken";

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
// get all pending product from retailer
const getPendingOffersFromRetailer = catchAsync(async (req: Request, res: Response) => {

    if (!req.user || !req.user.id) {
        return res.status(400).json({
            success: false,
            message: "User not authenticated",
        });
    }

    const result = await sendOfferService.getPendingOffersFromRetailerIntoDB(req.user);


    if (result.offers.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No pending offers found",
            data: [],
        });
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully fetched pending offers",
        data: result.offers,
    });
});

// get single offer from db for retailer
const getSinglePendingOfferFromRetailer = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }

    const { id } = req.params;
    if (!id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Offer ID is required");
    }

    const offer = await sendOfferService.getSinglePendingOfferFromRetailerIntoDB(user.id, id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully fetched single pending offer",
        data: offer,
    });
});




export const sendOfferController = {
    createOfferController,
    updateOffer,
    confirmOrderFromRetailer,
    getPendingOffersFromRetailer,
    getSinglePendingOfferFromRetailer
};
