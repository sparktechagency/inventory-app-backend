import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createPaymentController = catchAsync(async (req: Request, res: Response) => {
    const paymentData = req.body;
    const result = await PaymentService.createPaymentService(paymentData);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Package found',
        data: result,
    })
});


export const PaymentController = {
    createPaymentController,
};
