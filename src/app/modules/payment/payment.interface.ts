import { Types } from "mongoose";

export interface IPayment {
  userId: Types.ObjectId | undefined;
  amount: number;
  currency: string;
  paymentIntentId: string;
  status: "pending" | "succeeded" | "failed";
}
