import { model, Schema, Types } from "mongoose";
import { IProductSend } from "./productSend.interface";

const productSendSchema = new Schema<IProductSend>(
    {
        product: { type: [Types.ObjectId], ref: "sendOffer", required: true },
        status: { type: String, enum: ["pending", "confirm", "received"], default: "pending" },
        retailer: { type: Types.ObjectId, ref: "User", required: true },
        wholesaler: { type: [Types.ObjectId], ref: "User", required: true }
    },
    {
        timestamps: true,
    }
);

export const ProductSendModel = model<IProductSend>("ProductSend", productSendSchema);