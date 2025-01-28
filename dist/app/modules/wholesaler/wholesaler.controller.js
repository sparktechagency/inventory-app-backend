"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wholesalerController = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const wholesaler_service_1 = require("./wholesaler.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const getAllWholeSalers = (0, catchAsync_1.default)(async (req, res) => {
    const result = await wholesaler_service_1.wholesalerServices.getAllWholeSaler();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.OK, 'No products found!');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
});
// get single wholesaler
const getWholeSalerById = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    // Fetch wholesaler by ID from service
    const result = await wholesaler_service_1.wholesalerServices.getWholeSalerById(id);
    // Send response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Wholesaler retrieved successfully",
        data: result,
    });
});
// 
exports.wholesalerController = {
    getAllWholeSalers,
    getWholeSalerById,
};
