import { paymentVerificationModel } from "./multiPaymentMethod.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const getAllSuccessfulPayment = async () => {
    const result = await paymentVerificationModel.find({ status: "successful" });
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No successful payments found");
    }
    return result;
}

export const multiPaymentMethodService = {
    getAllSuccessfulPayment
}   
