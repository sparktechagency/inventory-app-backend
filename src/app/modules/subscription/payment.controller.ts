import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import { SubscriptionService } from "./payment.service";
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";



// subscription details from DB
const subscriptionDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.subscriptionDetailsFromDB(req.user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Details Retrieved Successfully",
        data: result.subscription
    })
});


const subscriptions = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.subscriptionDetailsFromDB(req.body)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription List Retrieved Successfully",
        data: result
    })
})

const companySubscriptionDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.companySubscriptionDetailsFromDB(req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Company Subscription Details Retrieved Successfully",
        data: result.subscription
    })
});


export const SubscriptionController = {
    subscriptionDetails,
    subscriptions,
    companySubscriptionDetails
}