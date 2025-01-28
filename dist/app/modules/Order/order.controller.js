"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const order_service_1 = require("./order.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
// create a new product
const createProduct = (0, catchAsync_1.default)(async (req, res, next) => {
    const { ...productData } = req.body;
    const result = await order_service_1.orderService.createProductIntoDB(productData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Product Details Create successfully.',
        data: {
            result
        },
    });
});
// get fall products
const getAllProducts = (0, catchAsync_1.default)(async (req, res) => {
    const result = await order_service_1.orderService.getAllProducts();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No products found!');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
});
// delete product
const deleteSingleProduct = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const ProductData = await order_service_1.orderService.deleteProductFromDB(id);
    if (!ProductData) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Product not found! Please provide a valid product ID. 400 Bad Request');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Product deleted successfully",
        data: ProductData,
    });
});
// update product 
const updateSingleProduct = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const updatedProduct = await order_service_1.orderService.updateProductInDB(id, payload);
    if (!updatedProduct) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Product not found! Please provide a valid product ID.');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
    });
});
exports.productController = { createProduct, deleteSingleProduct, getAllProducts, updateSingleProduct };
