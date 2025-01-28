"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductZodSchema = void 0;
const zod_1 = require("zod");
const units_1 = require("../../../enums/units");
const createProductZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Product name is required" }),
        unit: zod_1.z.enum(Object.values(units_1.UNIT), {
            required_error: "Unit is required",
        }),
        quantity: zod_1.z
            .number({ required_error: "Quantity is required" })
            .min(0, { message: "Quantity must be a positive number" }),
        additionalInfo: zod_1.z.string().optional(),
    }),
});
exports.createProductZodSchema = createProductZodSchema;
