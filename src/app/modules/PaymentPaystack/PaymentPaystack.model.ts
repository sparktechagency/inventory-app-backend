import { model, Schema } from "mongoose";
import { IPaymentPaystack } from "./PaymentPaystack.interface";

const PaymentPaystack = new Schema<IPaymentPaystack>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price must be a positive number"],
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
            required: [true, "Features are required"],
            validate: {
                validator: function (v: string[]) {
                    return v && v.length > 0;
                },
                message: "Features array cannot be empty",
            },
        },
        paymentType: {
            type: String,
            required: [true, "Payment type is required"],
            enum: ["Monthly", "Yearly"],
        },
        productId: {
            type: String,
        },
        paymentLink: {
            type: String,
        },
    }, { timestamps: true });


export const PaymentPaystackModel = model<IPaymentPaystack>("PaymentPaystack", PaymentPaystack)