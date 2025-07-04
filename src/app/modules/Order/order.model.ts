import { model, Schema } from "mongoose";
import { IProduct } from "./order.interface";
import { UNIT } from "../../../enums/units";

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        unit: {
            type: String,
            enum: Object.values(UNIT),
            required: true,
        },
        quantity: { type: Number, required: true },
        additionalInfo: { type: String },
        Delivery: { type: Boolean, default: false },
        availability: { type: Boolean, default: false },
        price: { type: Number }
    },
    { timestamps: true }
);

export const ProductModel = model<IProduct>("Product", productSchema);