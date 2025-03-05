import axios from "axios";
import config from "../config";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
const PAYSTACK_SECRET_KEY = config.paystack.secretKey;
const PAYSTACK_BASE_URL = config.paystack.PAYSTACK_BASE_URL
export const generatePaystackPaymentLink = async (amount: number, email: string) => {
    try {



        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email,
                amount: amount * 100,
                currency: "NGN",
                reference: `pkg_${Date.now()}`,
                callback_url: "https://localhost:3000/payment-success",
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.data.authorization_url;
    } catch (error: any) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to generate Paystack payment link")
    }
};