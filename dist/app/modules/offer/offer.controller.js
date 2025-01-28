"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOfferController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const http_status_codes_1 = require("http-status-codes");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const offer_service_1 = require("./offer.service");
// Create a new product Controller
const createOffer = (0, catchAsync_1.default)(async (req, res) => {
    const io = global.io;
    const result = await offer_service_1.sendOfferService.createOffer(req.body, io);
    // console.log("result:--->>>>>", result);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: "Order created and notification sent successfully",
        data: result.order,
    });
});
// update offer from wholesaler
const updateOffer = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const io = global.io;
    const result = await offer_service_1.sendOfferService.updateOfferIntoDB(id, req.body, io);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Offer updated and notification sent successfully",
        data: result.updatedOffer,
    });
});
// Again update from retailer to wholesaler
const confirmOrderFromRetailer = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const io = global.io;
    const result = await offer_service_1.sendOfferService.updateOfferFromRetailer(id, req.body, io);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Offer updated and notification sent successfully from retailer",
        data: result.updatedOffer,
    });
});
exports.sendOfferController = {
    createOffer,
    updateOffer,
    confirmOrderFromRetailer
};
