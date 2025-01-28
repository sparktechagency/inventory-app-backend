"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_1 = require("../../../enums/user");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8,
    },
    confirmPassword: {
        type: String,
        required: true,
    },
    businessName: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(user_1.USER_ROLES),
        required: true,
    },
    businessCategory: {
        type: String,
        enum: Object.values(user_1.BUSINESS_CATEGORY),
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    status: {
        type: String,
        enum: ['active', 'delete'],
        default: 'active',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    authentication: {
        type: {
            isResetPassword: {
                type: Boolean,
                default: false,
            },
            oneTimeCode: {
                type: Number,
                default: null,
            },
            expireAt: {
                type: Date,
                default: null,
            },
        },
        select: false,
    },
}, { timestamps: true });
// Check if a user exists by ID
userSchema.statics.isExistUserById = async function (id) {
    return await this.findById(id);
};
// Check if a user exists by email
userSchema.statics.isExistUserByEmail = async function (email) {
    return await this.findOne({ email });
};
// Check if the provided password matches the hashed password
userSchema.statics.isMatchPassword = async function (password, hashPassword) {
    return await bcrypt_1.default.compare(password, hashPassword);
};
// Middleware for pre-save logic
userSchema.pre('save', async function (next) {
    // Cast `this.constructor` to the model type to access `findOne`
    const UserModel = this.constructor;
    if (this.isModified('email')) {
        const isExist = await UserModel.findOne({ email: this.email });
        if (isExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exists!');
        }
    }
    if (this.isModified('password')) {
        this.password = await bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
    }
    next();
});
// Export the model
exports.User = (0, mongoose_1.model)('User', userSchema);
