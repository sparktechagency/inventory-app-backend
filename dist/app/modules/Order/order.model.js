"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const units_1 = require("../../../enums/units");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    unit: {
        type: String,
        enum: Object.values(units_1.UNIT),
        required: true,
    },
    quantity: { type: Number, required: true },
    additionalInfo: { type: String, default: null },
}, { timestamps: true });
exports.ProductModel = (0, mongoose_1.model)("Product", productSchema);
