import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { PaymentPaystackService } from "./PaymentPaystack.service";
import sendResponse from "../../../shared/sendResponse";

const createPackage = catchAsync(async (req: Request, res: Response) => {
    const { name, description, price, duration, paymentType, features, userEmail } = req.body
    if (!name || !description || !price || !duration || !paymentType || !features || !userEmail) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required, including userEmail")
    }
    const newPackage = await PaymentPaystackService.createPaystackPackageIntoDB(req.body, userEmail);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Package create successfully",
        data: newPackage
    })

})


export const paymentPaystackController = {
    createPackage
}