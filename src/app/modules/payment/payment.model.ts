import mongoose, { Schema, Types } from "mongoose";
import { IPayment, PaymentModel } from "./payment.interface";



const paymentSchema = new Schema<IPayment>(
  {

    customerId: {
      type: String,
      required: [true, "Customer ID is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: [true, "Package is required"],
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment, PaymentModel>("Payment", paymentSchema);
// _id?: string;
//   customerId: string;
//   price: number;
//   user: Types.ObjectId;
//   package: Types.ObjectId;
//   trxId: string;
//   subscriptionId: string;
//   status: 'expired' | 'active' | 'cancel';
//   currentPeriodStart: string;
//   currentPeriodEnd: string;