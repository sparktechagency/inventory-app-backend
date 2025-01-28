"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const order_model_1 = require("./order.model");
const createProductIntoDB = async (payload) => {
    const createProduct = await order_model_1.ProductModel.create(payload);
    if (!payload.name || !payload.unit || payload.quantity === undefined) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Missing required fields");
    }
    if (!createProduct) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create Product');
    }
    return createProduct;
};
// get all products
const getAllProducts = async () => {
    const products = await order_model_1.ProductModel.find();
    if (!products) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get products');
    }
    return products;
};
// delete product from db
const deleteProductFromDB = async (id) => {
    const productData = await order_model_1.ProductModel.findByIdAndDelete(id);
    if (!productData) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Product not found');
    }
    return productData;
};
// update product in db
const updateProductInDB = async (id, payload) => {
    const updatedProduct = await order_model_1.ProductModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return updatedProduct;
};
exports.orderService = {
    createProductIntoDB,
    getAllProducts,
    deleteProductFromDB,
    updateProductInDB
};
