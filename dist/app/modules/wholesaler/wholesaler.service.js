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
const getAllWholeSaler = async (search) => {
    const filter = { role: user_1.USER_ROLES.Wholesaler };
    // console.log("Search parameter received:", search);
    // Add search condition if `search` is provided
    if (search) {
        filter.businessName = { $regex: search, $options: 'i' };
    }
    // console.log("Generated Filter:", JSON.stringify(filter, null, 2));
    try {
        // Fetch wholesalers matching the filter
        const wholeSalerUsers = await user_model_1.User.find(filter);
        // console.log("Matched Wholesalers:", wholeSalerUsers);
        if (!wholeSalerUsers || wholeSalerUsers.length === 0) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No wholesalers found!');
        }
        return wholeSalerUsers;
    }
    catch (error) {
        console.error("Error fetching wholesalers:", error);
        throw error;
    }
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
