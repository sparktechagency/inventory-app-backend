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


// delete single pending offers from retailer

const deleteSinglePendingOfferFromRetailer = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }
    const { id } = req.params;
    if (!id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Offer ID is required");
    }
    const offer = await sendOfferService.deleteSinglePendingOfferFromRetailer(user.id, id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully deleted single pending offer",
        data: offer,
    })
})

// ! delete single pending offers from retailer
const getAllReceiveOffers = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }
    const result = await sendOfferService.getAllReceiveOffers(user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully fetched received offers",
        data: result,
    });
})

// get single offer from db for retailer
const getSingleReceiveOfferFromRetailerIntoDB = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }
    const { id } = req.params;
    if (!id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Offer ID is required");
    }
    const offer = await sendOfferService.getSingleReceiveOfferFromRetailerIntoDB(user.id, id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully fetched single receive offer",
        data: offer,
    })
})


// delete single received offers from retailer
const deleteSingleReceiveOfferFromRetailer = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }
    const { id } = req.params;
    if (!id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Offer ID is required");
    }
    await sendOfferService.deleteReceiveOffers(user.id, id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully deleted single receive offer",
        data: null,
    })
})

// confirm
const getAllConfirmOffers = async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }
    const result = await sendOfferService.getAllConfirmOffers(user);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No received offers found");
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully fetched received offers",
        data: result,
    });
}

// single one 
const getSingleConfirmOffer = async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }
    const { id } = req.params;
    if (!id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Offer ID is required");
    }
    const offer = await sendOfferService.getSingleConfirmOffer(user);
    if (!offer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No received offer found");
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully fetched single receive offer",
        data: offer,
    })
}

// delete confirm offers
const deleteSingleConfirmOffer = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    if (!user?.id) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User is not authenticated");
    }
    const { id } = req.params;
    if (!id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Offer ID is required");
    }
    await sendOfferService.deleteConfirmOffers(user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successfully deleted single confirm offer",
        data: null,
    })
})


export const sendOfferController = {
    createOfferController,
    updateOffer,
    confirmOrderFromRetailer,
    getPendingOffersFromRetailer,
    getSinglePendingOfferFromRetailer,
    deleteSinglePendingOfferFromRetailer,
    // receive offers
    getAllReceiveOffers,
    getSingleReceiveOfferFromRetailerIntoDB,

    deleteSingleReceiveOfferFromRetailer,

    // confirm
    getAllConfirmOffers,
    getSingleConfirmOffer,
    deleteSingleConfirmOffer
};
