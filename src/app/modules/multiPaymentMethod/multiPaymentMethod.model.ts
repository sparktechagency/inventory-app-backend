import { model, Schema } from "mongoose";
import { IPaymentVerification } from "./multiPaymentMethod.interface";

const PaymentVerificationSchema = new Schema<IPaymentVerification>(
    {
        email: { type: String, required: true },
        transactionId: { type: String, unique: true, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: { type: String, enum: ["successful", "failed"], required: true },
        startTime: { type: Date },
        endTime: { type: Date },
        // verifiedAt: { type: Date, required: true, default: Date.now },
    },
    { timestamps: true }
);


export const paymentVerificationModel = model<IPaymentVerification>("paymentVerification", PaymentVerificationSchema);