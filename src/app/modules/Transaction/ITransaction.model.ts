import { model, Schema } from "mongoose";
import { ITransaction } from "./ITransaction.interface";

const ITransactionSchema = new Schema<ITransaction>(
    {
        reference: { type: String, required: true, unique: true },
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        status: { type: String, required: true },
        customerEmail: { type: String, required: true },
        paymentMethod: { type: String, required: true },
        transactionDate: { type: Date, required: true },
    },
    { timestamps: true }
)
export const TransactionModel = model<ITransaction>("Transaction", ITransactionSchema)