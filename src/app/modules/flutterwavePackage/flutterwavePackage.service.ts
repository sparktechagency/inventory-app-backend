import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { flutterWaveModel } from "./flutterwavePackage.model";
import axios from "axios";
import { paymentVerificationModel } from "../multiPaymentMethod/multiPaymentMethod.model";
import { verifyPaymentTransaction } from "../../../helpers/paymentVerificationHelper";

const createSubscriptionPackage = async (
    userEmail: string,
    tx_ref: string,
    amount: number,
    status: string,
    redirect_url: string
) => {
    try {
        const subscription = await flutterWaveModel.create({
            userEmail,
            transactionId: tx_ref,
            amount,
            status,
            tx_ref,
            redirect_url,
        });

        return subscription;
    } catch (error) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "Failed to store subscription in the database.");
    }
};


const SubscriptionPackageVerify = async (transaction_id: string) => {
    const res = await verifyPaymentTransaction(transaction_id);
    return res
};



// get all
const allPackageData = async () => {
    const result = await flutterWaveModel.find()
    return result
}


export const flutterWaveService = {
    createSubscriptionPackage,
    SubscriptionPackageVerify,
    allPackageData
};
