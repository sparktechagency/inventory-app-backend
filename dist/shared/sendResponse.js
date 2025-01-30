"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    const resData = {
        success: data.success,
        message: data.message,
        pagination: data.pagination,
        data: data.data,
        Total: Array.isArray(data.data) ? data.data.length : undefined,
    };
    res.status(data.statusCode).json(resData);
};
exports.default = sendResponse;
