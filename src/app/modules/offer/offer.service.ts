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
    if (!payload.wholeSeller || !payload.retailer || !payload.product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Wholesaler, Retailer, and Product IDs are required");
    }

    // Create the offer
    const order = await OfferModel.create(payload);
    if (!order) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create the offer");
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
    try {
        // Step 1: Find the offer and populate product details
        const existingOffer = await OfferModel.findById(offerId).populate("product");

        if (!existingOffer) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
        }

        if (!existingOffer.product) {
            console.error("❌ Product not found. Check if the product ID is missing or incorrect.");
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
                console.log("Updated Product Quantity:", product?.quantity);
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
        console.error("🚨 Error in updateOfferFromRetailer:", error);
        throw error;
    }
};

export const sendOfferService = {
    createOffer,
    updateOfferIntoDB,
    updateOfferFromRetailer
};
