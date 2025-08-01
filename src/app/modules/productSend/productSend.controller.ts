import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { productSendService } from "./productSend.service";
import { Request, Response } from "express";
import { Types } from "mongoose";

const sendProductToWholesaler = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await productSendService.sendProductToWholesalerIntoDB(user, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Product sent to wholesaler successfully',
        data: result,
    });
})


const getAllProductToWholesaler = catchAsync(
    async (req: Request, res: Response) => {
        const type = req.params.type as "pending" | "confirm" | "received";
        const user = req.user;

        const result = await productSendService.getAllProductSendToWholeSalerFromDB(
            user,
            type,
            req.query
        );

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Products fetched successfully',
            pagination: result.meta,
            data: result.data,
        });
    }
);

const updateProductSendDetail = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await productSendService.updateProductSendDetailIntoDB(req.params.id, user, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Product updated successfully',
        data: result,
    });
})


export const productSendControllerFromRetailer = {
    sendProductToWholesaler,
    getAllProductToWholesaler,
    updateProductSendDetail
}