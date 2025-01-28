"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const user_1 = require("../../../enums/user");
const createUserZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name is required" }),
        email: zod_1.z
            .string({ required_error: "Email is required" })
            .email({ message: "Invalid email format" }),
        password: zod_1.z
            .string({ required_error: "Password is required" })
            .min(8, { message: "Password must be at least 8 characters long" }),
        confirmPassword: zod_1.z
            .string({ required_error: "Confirm password is required" })
            .min(8, { message: "Confirm password must be at least 8 characters long" }),
        businessName: zod_1.z.string({ required_error: "Business name is required" }),
        role: zod_1.z.enum(Object.values(user_1.USER_ROLES), {
            required_error: "Role is required",
        }),
        businessCategory: zod_1.z.enum(Object.values(user_1.BUSINESS_CATEGORY), {
            required_error: "Business category is required",
        }),
        location: zod_1.z.string({ required_error: "Location is required" }),
        image: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'delete'], { required_error: "Status is required" }),
        verified: zod_1.z.boolean({ required_error: "Verified is required" }),
        authentication: zod_1.z
            .object({
            isResetPassword: zod_1.z.boolean().optional(),
            oneTimeCode: zod_1.z.number().optional(),
            expireAt: zod_1.z
                .preprocess((arg) => (typeof arg === "string" ? new Date(arg) : arg), zod_1.z.date())
                .optional(),
        })
            .optional(),
    }),
});
const updateUserZodSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
exports.UserValidation = {
    createUserZodSchema,
    updateUserZodSchema,
};
