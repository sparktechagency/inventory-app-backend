import axios from "axios";
import { paymentVerificationModel } from "../app/modules/multiPaymentMethod/multiPaymentMethod.model";
import { flutterWaveModel } from "../app/modules/flutterwavePackage/flutterwavePackage.model";
import config from "../config";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const FLW_SECRET_KEY = config.FLUTTER_WAVE.SECRETKEY;
const FLW_API_URL = "https://api.flutterwave.com/v3/transactions";

export const verifyPaymentTransaction = async (transaction_id: string, userEmail: string) => {
    try {
        // Make the request to verify the payment
        const response = await axios.get(`${FLW_API_URL}/${transaction_id}/verify`, {
            headers: {
                Authorization: `Bearer ${FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        // Ensure the response is successful and the payment status is "successful"
        if (response.data.status === "success" && response.data.data.status === "successful") {
            const paymentData = response.data.data;

            const existingPayment = await paymentVerificationModel.findOne({ transactionId: paymentData?.tx_ref });
            if (existingPayment) {
                console.log("Payment already verified for this transactionId. Skipping insertion.");
            } else {
                const payload = {
                    email: userEmail,
                    transactionId: paymentData?.tx_ref,
                    amount: paymentData?.amount,
                    currency: paymentData?.currency,
                    status: "successful"
                };

                await paymentVerificationModel.create(payload);
            }

            const updateData = {
                status: "successful",
                updatedAt: new Date(),
            };

            const result = await flutterWaveModel.findOneAndUpdate(
                { transactionId: paymentData.tx_ref },
                { $set: updateData },
                { upsert: true, new: true }
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
            throw new ApiError(StatusCodes.BAD_REQUEST, "Payment verification failed! Payment status is not successful.");
        }

    } catch (error: any) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Payment verification failed! Error: ${error.message}`);
    }
};
