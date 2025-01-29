import mongoose, { Schema, Document, Types } from "mongoose";
import { IPayment } from "./payment.interface";
import { PAYMENT } from "../../../enums/payment";

interface IPaymentModel extends IPayment, Document { }

const Payment = new Schema<IPaymentModel>(
  {
    userId: { type: Types.ObjectId, required: true, ref: "User" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentIntentId: { type: String, required: true },
    status: { type: String, enum: PAYMENT, default: "pending" },
  },
  { timestamps: true }
);

export const PaymentSchema = mongoose.model<IPaymentModel>("Payment", Payment);
