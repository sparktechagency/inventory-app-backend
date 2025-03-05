import mongoose, { Schema, Types } from "mongoose";
import { IMultiPaymentMethod } from "./multiPaymentMethod.interface";



const multiPaymentSchema = new Schema<IMultiPaymentMethod>(
    {
        customerId: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        trxId: {
            type: String,
            required: true
        },
        subscriptionId: {
            type: String,
            required: true
        },
        currentPeriodStart: {
            type: String,
            required: true
        },
        currentPeriodEnd: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['flutterwave', 'paystack'],
            required: true
        },
        status: {
            type: String,
            enum: ["expired", "active", "cancel"],
            default: "active",
            required: true
        },

    },
    { timestamps: true }
);

export const Payment = mongoose.model<IMultiPaymentMethod>("package", multiPaymentSchema);