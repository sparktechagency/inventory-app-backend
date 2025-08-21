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
        pagination: result.meta,
        data: result.result,
    });
})




const updateSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await sendOfferService.updateSingleProductIntoDB(req.params.id, user, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Product updated successfully',
        data: result,
    });
})



const deleteSingleOrMulifulOrder = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    const result = await sendOfferService.deleteSingleOrMulifulOrderIntoDB(req.params.id, user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Order deleted successfully',
        data: result,
    });
});


// all order history
const productHistoryFromDB = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await sendOfferService.productHistoryFromDB(user);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Orders fetched successfully',
        pagination: result.meta,
        data: result.result,
    });
})


export const sendOfferController = {
    createNewOrder,
    getAllNewOrders,
    updateSingleProduct,
    deleteSingleOrMulifulOrder,
    productHistoryFromDB
}