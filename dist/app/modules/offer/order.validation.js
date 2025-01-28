"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const status_1 = require("../../../enums/status");
// Custom validator for MongoDB ObjectId
const objectIdValidator = zod_1.z.string().refine((id) => mongoose_1.default.Types.ObjectId.isValid(id), {
    message: "Invalid MongoDB ID",
});
const offerValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: objectIdValidator,
        orderId: objectIdValidator,
        status: zod_1.z.enum(Object.values(status_1.STATUS), {
            required_error: "Status is required",
        }),
    }),
});
exports.default = offerValidationSchema;
