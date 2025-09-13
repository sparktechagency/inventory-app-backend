import { model, Schema, Types } from "mongoose";
import { ISendOffer } from "./sendOffer.interface";
import { UNIT } from "../../../enums/units";


const sendOfferSchemaForRetailer = new Schema<ISendOffer>(
    {
        productName: { type: String, required: true },
        unit: {
            type: String,
            enum: Object.values(UNIT),
            required: true,
        },
        quantity: { type: Number, required: true },
        additionalInfo: { type: String },
        retailer: { type: Types.ObjectId, ref: "User" },
        status: { type: Boolean, default: false },
        price: { type: Number },
        availability: { type: Boolean },
    },
    {
        timestamps: true,
    }
);

// Create the model
export const SendOfferModelForRetailer = model<ISendOffer>("sendOffer", sendOfferSchemaForRetailer); 