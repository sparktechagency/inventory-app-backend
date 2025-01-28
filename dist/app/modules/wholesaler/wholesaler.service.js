"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wholesalerServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("../user/user.model");
const user_1 = require("../../../enums/user");
// get all wholesaler from db
const getAllWholeSaler = async () => {
    const wholeSalerUser = await user_model_1.User.find({ role: user_1.USER_ROLES.Wholesaler });
    if (!wholeSalerUser || wholeSalerUser.length === 0) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No wholesalers found!');
    }
    return wholeSalerUser;
};
// get single wholesaler from db
const getWholeSalerById = async (id) => {
    const wholeSalerUser = await user_model_1.User.findById(id);
    if (!wholeSalerUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Wholesaler not found!');
    }
    return wholeSalerUser;
};
// 
exports.wholesalerServices = {
    getAllWholeSaler,
    getWholeSalerById
};
