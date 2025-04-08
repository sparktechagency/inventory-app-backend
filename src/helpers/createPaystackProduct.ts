import axios from "axios"
import config from "../config";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";
const PAYSTACK_SECRET_KEY = config.paystack.secretKey;
export const createPaystackProduct = async (name: string, description: string, price: number) => {
    try {
        const priceInKobo = price * 100;
        const res = await axios.post(
            "https://api.paystack.co/product",
            {
                name,
                description,
                price: priceInKobo,
                currency: "NGN"
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );
        console.log("Paystack Product Created:", res.data);
        return res.data
    } catch (error) {
        console.error("Paystack API Error Response:", error.response ? error.response.data : error.message);
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Paystack Product")
    }
}