import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { replayFromWholesalerService } from "./replayFromWholesaler.service";
import { Request, Response } from "express";

const getAllReceivedRequestFromWholesaler = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await replayFromWholesalerService.getAllReceivedRequestFromWholesalerFromDB(user, req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Orders fetched successfully',
        pagination: result.meta,
        data: result.data,
    });
})

const updateRequestFromWholesalerAsRetailerForConfirm = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const { id } = req.params
    const result = await replayFromWholesalerService.updateRequestFromWholesalerAsRetailerForConfirm(user, id)

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Orders updated successfully',
        data: result,
    });
})



export const replayFromWholesalerController = {
    getAllReceivedRequestFromWholesaler,
    updateRequestFromWholesalerAsRetailerForConfirm
}




