import { OfferModel } from "./offer.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IOrder } from "./offer.interface";
import { notificationSender } from "../../../helpers/notificationSender";
import { Server } from "socket.io";
import { STATUS } from "../../../enums/status";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
// Service to create a new product (order)

const createOffers = async (payloads: IOrder[], io: Server) => {
    if (!Array.isArray(payloads) || payloads.length === 0) {
        console.error("Invalid payloads: Must be an array with at least 1 item");
        throw new ApiError(StatusCodes.BAD_REQUEST, "You must provide at least 1 order");
    }

    if (payloads.length > 5) {
        console.error("Too many orders: Cannot exceed 5");
        throw new ApiError(StatusCodes.BAD_REQUEST, "You can only send between 1 to 5 orders at a time");
    }

    const createdOrders = [];

    for (const payload of payloads) {
        if (!payload.wholeSeller || !payload.retailer || !Array.isArray(payload.products) || payload.products.length === 0) {
            console.error("Missing required fields in payload:", payload);
            throw new ApiError(StatusCodes.BAD_REQUEST, "Wholesaler, Retailer, and at least one Product ID are required");
        }

        // Create a single order with multiple products
        const order = await OfferModel.create({
            retailer: payload.retailer,
            wholeSeller: payload.wholeSeller,
            product: payload.product,  // Store all products in one order
            status: payload.status,
            price: payload.price,
            Delivery: payload.Delivery,
            availability: payload.availability
        });

        if (!order) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create the offer");
        }

        createdOrders.push(order);

        // Send Notification
        const notificationData = {
            userId: payload.wholeSeller.toString(),
            title: "New Order Received",
            message: `Retailer has sent an order with multiple products for ${order._id}.`,
            type: "order",
        };

        await notificationSender(io, `getNotification::${payload.wholeSeller}`, notificationData);
    }

    return { orders: createdOrders };
};






// update offer from wholesaler
const updateOfferIntoDB = async (
    user: JwtPayload,
    offerId: string,
    payload: Partial<IOrder>,
    io: Server
) => {
    // Check if user is subscribed
    const userData = await User.findById(user._id).select("isSubscribed").lean();
    if (!userData) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    const isSubscribed = userData.isSubscribed;
    const isExistLimit = await OfferModel.countDocuments({ wholeSeller: user._id, status: "Received" });

    if (!isSubscribed && isExistLimit >= 10) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "You can not update more than 10 offers. Subscribe to update more offers."
        );
    }

    // Find existing offer
    const existingOffer = await OfferModel.findById(offerId);
    if (!existingOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }

    // Prepare update fields, only setting values if they exist in payload
    const updateFields: Partial<IOrder> = {
        status: "Received", // Always update status
        ...(payload.availability !== undefined && { availability: payload.availability }),
        ...(payload.price !== undefined && { price: payload.price }),
        ...(payload.Delivery !== undefined && { Delivery: payload.Delivery }),
    };

    // Update offer
    const updatedOffer = await OfferModel.findByIdAndUpdate(offerId, { $set: updateFields }, { new: true });

    if (!updatedOffer) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update the offer");
    }

    // Notify retailer
    const notificationData = {
        userId: existingOffer.retailer!.toString(),
        title: "Offer Updated",
        message: `Your order ${offerId} has been updated to "Received".`,
        type: "offer-update",
    };

    await notificationSender(io, `getNotification::${existingOffer.retailer}`, notificationData);

    return { updatedOffer };
};




const updateOfferFromRetailer = async (
    offerId: string,
    payload: { quantity?: number; status?: STATUS },
    io: Server
) => {
    try {
        // Step 1: Find the offer and populate product details
        const existingOffer = await OfferModel.findById(offerId).populate("product");

        if (!existingOffer) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
        }

        if (!existingOffer.product) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Product not found. Check if the product ID is missing or incorrect.");
        }

        const product = existingOffer.product;

        // Step 2: Check if quantity needs to be updated
        if (payload.quantity) {
            // if (payload.quantity > product?.quantity) {
            //     throw new ApiError(
            //         StatusCodes.BAD_REQUEST,
            //         `Insufficient stock. Available quantity: ${product?.quantity}`
            //     );
            // }

            // Step 3: If status is 'Confirmed', deduct the quantity from product stock
            if (payload.status === STATUS.confirm) {
                product?.quantity -= payload.quantity;
                await product.save();
            }
        }

        // Step 4: Update offer status if provided
        if (payload.status) {
            existingOffer.status = payload.status;
        }

        // Step 5: Save the updated offer
        await existingOffer.save();

        // Step 6: Notify the wholesaler via Socket.IO
        const notificationData = {
            userId: existingOffer.wholeSeller!.toString(),
            title: "Order Updated by Retailer",
            message: `Retailer has updated the order ${offerId}.`,
            type: "order-update",
        };

        await notificationSender(io, `getNotification::${existingOffer.wholeSeller}`, notificationData);

        return { updatedOffer: existingOffer };
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Error updating order")
    }
};



// get all pending product from retailer


const getPendingOffersFromRetailerIntoDB = async (userId: string, role: string) => {
    try {
        if (!userId || !role) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid user credentials");
        }

        let filter: any = { status: STATUS.pending };

        if (role === USER_ROLES.Retailer) {
            filter.retailer = userId;
        } else if (role === USER_ROLES.Wholesaler) {
            filter.wholeSeller = userId;
        } else {
            throw new ApiError(StatusCodes.FORBIDDEN, "Unauthorized access");
        }

        const pendingOffers = await OfferModel.find(filter)
            .populate("retailer") // Only select necessary fields
            .populate("wholeSeller") // Only select necessary fields
            .populate("product") // Only select necessary fields
            .lean();

        return pendingOffers || [];
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch pending offers");
    }
};


// single pending Offer From retailer
const getSinglePendingOfferFromRetailerIntoDB = async (retailerId: string, offerId: string) => {
    const offer = await OfferModel.findOne({
        _id: offerId,
        retailer: retailerId,
        status: STATUS.pending,
    }).populate("retailer").populate("wholeSeller").populate("product").lean();;

    if (!offer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }

    return offer;
};


//  delete single pending offers from retailer


const deleteSinglePendingOfferFromRetailer = async (retailerId: string, offerId: string) => {
    const deletedOffer = await OfferModel.findByIdAndDelete({
        _id: offerId,
        retailer: retailerId,
        status: STATUS.pending,
    });
    if (!deletedOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }
    return deletedOffer
}


//  for receive offer from wholesaler
const getAllReceiveOffers = async (user: JwtPayload) => {
    const offers = await OfferModel.find({
        retailer: user.id,
        status: STATUS.received,
    }).populate("retailer").populate("wholeSeller").populate("product").lean();

    if (offers.length === 0) {  // Fix: Properly check for empty array
        throw new ApiError(StatusCodes.NOT_FOUND, "No received offers found");
    }
    return offers

}


// single receive offer from wholesaler
const getSingleReceiveOfferFromRetailerIntoDB = async (retailerId: string, offerId: string) => {
    const offer = await OfferModel.findOne({
        _id: offerId,
        retailer: retailerId,
        status: STATUS.received,
    }).populate("retailer").populate("wholeSeller").populate("product").lean();;
    if (!offer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }

    return offer;
}


// delete receive offers
const deleteReceiveOffers = async (user: JwtPayload, offerId: string) => {
    const deletedOffer = await OfferModel.findByIdAndDelete({
        _id: offerId,
        retailer: user.id,
        status: STATUS.received,
    });
    if (!deletedOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }
    return deletedOffer
}


// confirm 


// get all from confirm

const getAllConfirmOffers = async (user: JwtPayload) => {
    let query: any = {};

    if (user.role === "Retailer") {
        query.retailer = user.id;
        query.status = STATUS.confirm;
    } else if (user.role === "Wholesaler") {
        query.wholeSeller = user.id;
        query.status = STATUS.confirm;
    } else {
        throw new ApiError(StatusCodes.FORBIDDEN, "Access denied");
    }

    const offers = await OfferModel.find(query)
        .populate("retailer")
        .populate("wholeSeller")
        .populate("product")
        .lean();

    if (!offers || offers.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No offers found");
    }

    return offers;
};

// confirm single one
const getSingleConfirmOffer = async (user: JwtPayload) => {
    const offer = await OfferModel.findOne({
        retailer: user.id,
        status: STATUS.confirm,
    }).populate("retailer").populate("wholeSeller").populate("product").lean();;
    if (!offer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No confirmed offers found");
    }
    return offer
}

// delete confirm offers
const deleteConfirmOffers = async (user: JwtPayload) => {
    const deletedOffers = await OfferModel.deleteMany({
        retailer: user.id,
        status: STATUS.confirm,
    });
    if (!deletedOffers) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No confirmed offers found to delete");
    }
    return deletedOffers
}

export const sendOfferService = {
    createOffers,
    updateOfferIntoDB,
    updateOfferFromRetailer,
    getPendingOffersFromRetailerIntoDB,
    getSinglePendingOfferFromRetailerIntoDB,
    deleteSinglePendingOfferFromRetailer,
    // receive
    getAllReceiveOffers,
    getSingleReceiveOfferFromRetailerIntoDB,

    deleteReceiveOffers,

    // confirm
    getAllConfirmOffers,
    getSingleConfirmOffer,
    deleteConfirmOffers
};
