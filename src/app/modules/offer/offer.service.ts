import { OfferModel } from "./offer.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IOrder } from "./offer.interface";
import { notificationSender } from "../../../helpers/notificationSender";
import { Server } from "socket.io";
import { ProductModel } from "../Order/order.model";
import { STATUS } from "../../../enums/status";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
// Service to create a new product (order)
const createOffer = async (payload: IOrder, io: Server) => {
    const order = (await OfferModel.create(payload));
    if (!order) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create the offer");
    }
    if (payload.wholeSeller) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Wholesaler ID is required");
    }
    // Notify wholesaler via Socket.IO
    const notificationData = {
        userId: payload.wholeSeller!.toString(),
        title: "New Order Received",
        message: `Retailer has sent an order for ${order?._id}.`,
        type: "order",
    };
    await notificationSender(io, `getNotification::${payload.wholeSeller}`, notificationData);
    // @ts-ignore
    // const socket = global.io;
    // socket.emit(`getNotification::${payload.wholeSeller}`, notificationData);

    return { order };
};


// update offer from wholesaler
const updateOfferIntoDB = async (
    user: JwtPayload,
    offerId: string,
    payload: Partial<IOrder>,
    io: Server
) => {

    const isSubscribed: any = await User.findById(user._id).select("isSubscribed").lean();

    const isExistLimit = await OfferModel.countDocuments({ wholeSeller: user._id, status: "Received" });

    if (isSubscribed === false && isExistLimit === 10) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You can not update more than 10 offers. Now, you need to subscribe before updating.");
    }


    // Find the offer first to get the retailer ID for notification
    const existingOffer = await OfferModel.findById(offerId);
    if (!existingOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }

    const updatedOffer = await OfferModel.findByIdAndUpdate(
        offerId,
        {
            $set: {
                status: "Received",
                availability: payload.availability,
                price: payload.price,
            },
        },
        { new: true }
    );

    if (!updatedOffer) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update the offer");
    }

    // Notify retailer via Socket.IO
    const notificationData = {
        userId: existingOffer.retailer!.toString(),
        title: "Offer Updated",
        message: `Your order ${offerId} has been updated with new status: ${payload.status}`,
        type: "offer-update",
    };

    await notificationSender(
        io,
        `getNotification::${existingOffer.retailer}`,
        notificationData
    );

    return { updatedOffer };
};



const updateOfferFromRetailer = async (
    offerId: string,
    payload: { quantity?: number; status?: STATUS },
    io: Server
) => {
    // Step 1: Find the offer by ID
    const existingOffer = await OfferModel.findById(offerId);
    if (!existingOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }

    // Step 2: Check if the quantity needs to be updated
    if (payload.quantity) {
        // Step 2a: Find the associated product
        const product = await ProductModel.findById(existingOffer.product);
        if (!product) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
        }

        // Step 2b: Update the product's quantity
        product.quantity = payload.quantity;
        await product.save();
    }

    // Step 3: Update the offer status if provided
    if (payload.status) {
        existingOffer.status = payload.status;
        await existingOffer.save();
    }

    // Step 4: Notify the wholesaler via Socket.IO
    const notificationData = {
        userId: existingOffer.wholeSeller!.toString(),
        title: "Order Updated by Retailer",
        message: `Retailer has updated the order ${offerId}.`,
        type: "order-update",
    };

    await notificationSender(io, `getNotification::${existingOffer.wholeSeller}`, notificationData);

    return { updatedOffer: existingOffer };
};

export const sendOfferService = {
    createOffer,
    updateOfferIntoDB,
    updateOfferFromRetailer
};
