"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOfferService = void 0;
const offer_model_1 = require("./offer.model");
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const notificationSender_1 = require("../../../helpers/notificationSender");
const order_model_1 = require("../Order/order.model");
// Service to create a new product (order)
const createOffer = async (payload, io) => {
    const order = (await offer_model_1.OfferModel.create(payload));
    if (!order) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create the offer");
    }
    if (payload.wholeSeller) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Wholesaler ID is required");
    }
    // Notify wholesaler via Socket.IO
    const notificationData = {
        userId: payload.wholeSeller.toString(),
        title: "New Order Received",
        message: `Retailer has sent an order for ${order === null || order === void 0 ? void 0 : order._id}.`,
        type: "order",
    };
    await (0, notificationSender_1.notificationSender)(io, `getNotification::${payload.wholeSeller}`, notificationData);
    // @ts-ignore
    // const socket = global.io;
    // socket.emit(`getNotification::${payload.wholeSeller}`, notificationData);
    return { order };
};
// update offer from wholesaler
const updateOfferIntoDB = async (offerId, payload, io) => {
    // Find the offer first to get the retailer ID for notification
    const existingOffer = await offer_model_1.OfferModel.findById(offerId);
    if (!existingOffer) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Offer not found");
    }
    const updatedOffer = await offer_model_1.OfferModel.findByIdAndUpdate(offerId, {
        $set: {
            status: payload.status,
            availability: payload.availability,
            price: payload.price,
        },
    }, { new: true });
    if (!updatedOffer) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to update the offer");
    }
    // Notify retailer via Socket.IO
    const notificationData = {
        userId: existingOffer.retailer.toString(),
        title: "Offer Updated",
        message: `Your order ${offerId} has been updated with new status: ${payload.status}`,
        type: "offer-update",
    };
    await (0, notificationSender_1.notificationSender)(io, `getNotification::${existingOffer.retailer}`, notificationData);
    return { updatedOffer };
};
const updateOfferFromRetailer = async (offerId, payload, io) => {
    // Step 1: Find the offer by ID
    const existingOffer = await offer_model_1.OfferModel.findById(offerId);
    if (!existingOffer) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Offer not found");
    }
    // Step 2: Check if the quantity needs to be updated
    if (payload.quantity) {
        // Step 2a: Find the associated product
        const product = await order_model_1.ProductModel.findById(existingOffer.product);
        if (!product) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Product not found");
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
        userId: existingOffer.wholeSeller.toString(),
        title: "Order Updated by Retailer",
        message: `Retailer has updated the order ${offerId}.`,
        type: "order-update",
    };
    await (0, notificationSender_1.notificationSender)(io, `getNotification::${existingOffer.wholeSeller}`, notificationData);
    return { updatedOffer: existingOffer };
};
exports.sendOfferService = {
    createOffer,
    updateOfferIntoDB,
    updateOfferFromRetailer
};
