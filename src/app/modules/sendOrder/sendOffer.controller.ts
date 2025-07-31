import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { sendOfferService } from "./sendOffer.service";

const createNewOrder = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await sendOfferService.createNewOrderIntoDB(user, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Order created successfully',
        data: result,
    });
})


// get all new order
const getAllNewOrders = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await sendOfferService.getAllNewOrdersFromDB(user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Orders fetched successfully',
        data: result,
    });
})

export const sendOfferController = {
    createNewOrder,
    getAllNewOrders
}