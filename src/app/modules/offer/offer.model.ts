import { model, Schema, Types } from "mongoose";
import { STATUS } from "../../../enums/status";
import { IOrder } from "./offer.interface";

const productSchema = new Schema<IOrder>(
    {
        retailer: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        product: {
            type: Types.ObjectId,
            ref: "Product",
            required: true,
        },
        wholeSeller: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        price: {
            type: Number,
            // required: true,

        },
        status: {
            type: String,
            enum: Object.values(STATUS),
            required: true,
        },

    },
    {
        timestamps: true,
    }
);

// Create the model
export const OfferModel = model<IOrder>("sendOffer", productSchema);