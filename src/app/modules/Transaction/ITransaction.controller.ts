import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import { TransactionService } from "./ITransaction.service";

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
    const { reference } = req.params;
    const transaction = await TransactionService.TransactionIntoDB(reference);
    if (!transaction) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment verification failed")
    }
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment verified and stored successfully",
        data: transaction
    })
})

export const TransactionController = {
    verifyPayment
}