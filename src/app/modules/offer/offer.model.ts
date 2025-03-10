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
        product: [
            {
                productId: {
                    type: Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                availability: {
                    type: Boolean,
                    default: false,
                },
                price: {
                    type: Number,
                }
            }
        ],
        wholeSeller: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(STATUS),
            required: true,
        },
        Delivery: {
            type: Boolean,
        }
    },
    {
        timestamps: true,
    }
);

// Create the model
export const OfferModel = model<IOrder>("sendOffer", productSchema);