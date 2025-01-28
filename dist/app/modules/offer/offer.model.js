"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferModel = void 0;
const mongoose_1 = require("mongoose");
const status_1 = require("../../../enums/status");
const productSchema = new mongoose_1.Schema({
    retailer: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: mongoose_1.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    wholeSeller: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(status_1.STATUS),
        required: true,
    }
}, {
    timestamps: true,
});
// Create the model
exports.OfferModel = (0, mongoose_1.model)("sendOffer", productSchema);
