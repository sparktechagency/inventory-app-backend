import axios from "axios";
import { ITransaction } from "./ITransaction.interface";
import { TransactionModel } from "./ITransaction.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import config from "../../../config";

const PAYSTACK_SECRET = config.paystack.secretKey

const TransactionIntoDB = async (reference: string) => {
    if (!reference) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Reference is required");
    }
    try {
        const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
        });

        // Check if the response data structure is valid
        if (!res.data || !res.data.data) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid response from Paystack");
        }

        const data = res.data.data;

        // Check if the Paystack status is success
        if (data.status === "success") {
            const transaction: ITransaction = {
                reference: data.reference,
                amount: data.amount / 100, // Convert from kobo to naira
                currency: data.currency,
                status: data.status,
                customerEmail: data.customer.email,
                paymentMethod: data.channel,
                transactionDate: new Date(data.transaction_date),
            };

            const savedTransaction = await new TransactionModel(transaction).save();

            return savedTransaction;
        }

        // If payment status is not "success"
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment verification failed");
    } catch (error) {
        console.error("Error processing payment:", error);
        throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction processing failed")
    }
}

export const TransactionService = {
    TransactionIntoDB
}