import axios from "axios";
import { paymentVerificationModel } from "../app/modules/multiPaymentMethod/multiPaymentMethod.model";
import { flutterWaveModel } from "../app/modules/flutterwavePackage/flutterwavePackage.model";
import config from "../config";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const FLW_SECRET_KEY = config.FLUTTER_WAVE.SECRETKEY;
const FLW_API_URL = "https://api.flutterwave.com/v3/transactions";

export const verifyPaymentTransaction = async (transaction_id: string) => {
    try {
        // Step 1: Verify the payment using transaction_id
        const response = await axios.get(`${FLW_API_URL}/${transaction_id}/verify`, {
            headers: {
                Authorization: `Bearer ${FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });


        if (response.data.status === "success" && response.data.data.status === "successful") {
            const paymentData = response.data.data;

            // Step 2: Store verification details in the database
            await paymentVerificationModel.create({
                userEmail: paymentData.customer.email,
                transactionId: paymentData.id,
                amount: paymentData.amount,
                currency: paymentData.currency,
                status: "successful",
            });

            // Step 3: Update subscription status in flutterWaveModel
            await flutterWaveModel.findOneAndUpdate(
                { transactionId: paymentData.tx_ref }, // Use tx_ref to update
                { status: "successful", updatedAt: new Date() }
            );

            return {
                message: "Payment verified successfully!",
                status: "successful",
                transactionId: paymentData.id,
                tx_ref: paymentData.tx_ref,
                amount: paymentData.amount,
                currency: paymentData.currency,
                email: paymentData.customer.email,
                verifiedAt: new Date(),
            };
        } else {
            return { message: "Payment verification failed!", status: "failed" };
        }
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment verification failed!");
    }
};
