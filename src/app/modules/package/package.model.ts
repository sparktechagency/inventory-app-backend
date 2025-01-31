
import mongoose, { Schema } from "mongoose";
import { IPackage, packageModel } from "./package.interface";


const packageSchema = new Schema<IPackage>(
    {

        name: {
            type: String,
            required: [true, "Name is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        duration: {
            type: String,
            required: [true, "Duration is required"],
            enum: ["1 month", "3 months", "6 months", "1 year"],
        },
        features: {
            type: [String],
            required: [true, "Features is required"],
        },
    },
    { timestamps: true }
);

export const Package = mongoose.model<IPackage, packageModel>("package", packageSchema);