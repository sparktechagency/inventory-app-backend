import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { flutterWaveService } from "./flutterwavePackage.service";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { initiateSubscriptionPayment } from "../../../helpers/initiateSubscriptionPaymentForFlutterWeb";
import { verifyPaymentTransaction } from "../../../helpers/paymentVerificationHelper";

const createPackage = catchAsync(async (req: Request, res: Response) => {
    const { userEmail, amount } = req.body

    if (!userEmail || !amount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide userEmail and amount")
    }
    const paymentData = await initiateSubscriptionPayment(userEmail, amount);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully create Package",
        data: paymentData.data
    })

})


const verifySubscriptionPayment = catchAsync(async (req: Request, res: Response) => {
    const { transaction_id } = req.query;

    if (!transaction_id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID is required!")
    }

    const verificationData = await verifyPaymentTransaction(transaction_id.toString());
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully verify payment",
        data: verificationData
    })
});


// 
const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
    const transactions = await flutterWaveService.allPackageData();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully retrieved all transactions",
        data: transactions,
    });
});

export const flutterWaveController = {
    createPackage,
    verifySubscriptionPayment,
    getAllTransactions
}