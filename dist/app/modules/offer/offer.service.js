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
// Service to create a new product (order)
const createOffer = async (payload, io) => {
    const order = (await offer_model_1.OfferModel.create(payload));
    if (!order) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Failed to create the offer");
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
exports.sendOfferService = {
    createOffer,
};
