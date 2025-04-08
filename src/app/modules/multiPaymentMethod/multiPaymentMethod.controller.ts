import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { multiPaymentMethodService } from "./multiPaymentMethod.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
const getAllSuccessfulPayment = catchAsync(async (req: Request, res: Response) => {
    const result = await multiPaymentMethodService.getAllSuccessfulPayment();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Successful payments fetched successfully",
        data: result
    });
});

export const multiPaymentMethodController = {
    getAllSuccessfulPayment
}

