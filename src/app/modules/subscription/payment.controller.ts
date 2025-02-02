// import { Request, Response } from "express";
// import catchAsync from "../../../shared/catchAsync";
// import sendResponse from "../../../shared/sendResponse";
// import { StatusCodes } from "http-status-codes";
// import { subscriptionService } from "./payment.service";

// const subscriptions = catchAsync(async (req: Request, res: Response) => {
//     const result = await subscriptionService.subscriptionDetailsFromDB(req.query);

//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: "Subscription List Retrieved Successfully",
//         data: result
//     })
// });


// export const PaymentController = {
//     subscriptions,
// };
