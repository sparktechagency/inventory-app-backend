import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { flutterWaveService } from "./flutterwavePackage.service";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { initiateSubscriptionPayment } from "../../../helpers/initiateSubscriptionPaymentForFlutterWeb";
import { verifyPaymentTransaction } from "../../../helpers/paymentVerificationHelper";
import config from "../../../config";
const createPackage = catchAsync(async (req: Request, res: Response) => {
    const { userEmail, amount } = req.body;
    if (!userEmail || !amount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Please provide email and amount");
    }

    const paymentData = await initiateSubscriptionPayment(userEmail, amount);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully created Package",
        data: paymentData?.data
    });
});



const verifySubscriptionPayment = catchAsync(async (req: Request, res: Response) => {
    const { transaction_id, userEmail } = req.query;

    if (!transaction_id || !userEmail) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Transaction ID and User Email are required!");
    }

    const verificationData = await verifyPaymentTransaction(transaction_id.toString(), userEmail.toString());

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Successfully verified payment",
        data: verificationData
    });
});


//
const handlePaymentSuccess = catchAsync(async (req: Request, res: Response) => {
    const { status, tx_ref, transaction_id } = req.query;

    if (!status || !tx_ref || !transaction_id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required query parameters!");
    }

    if (status !== "successful") {
        return res.status(StatusCodes.BAD_REQUEST).send("<h1>Payment failed!</h1>");
    }

    // Verify the payment
    const verificationData = await flutterWaveService.SubscriptionPackageVerify(transaction_id.toString(), req.query.userEmail?.toString() || "");

    // Redirect frontend user
    res.redirect(`${config.FLUTTER_WAVE.payment_url}/subscription-success?tx_ref=${tx_ref}`);
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

// total earnings
const totalEarnings = catchAsync(async (req: Request, res: Response) => {
    const total = await flutterWaveService.totalEarnings();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Total earnings",
        data: total
    });
});


// total user subscription
const totalUserSubscription = catchAsync(async (req: Request, res: Response) => {
    const { name, email } = req.query;
    // @ts-ignore
    const total = await flutterWaveService.totalUserSubscription(name, email);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Total user subscription",
        data: total
    });
});

export const flutterWaveController = {
    createPackage,
    verifySubscriptionPayment,
    handlePaymentSuccess,
    getAllTransactions,
    totalEarnings,
    totalUserSubscription
}