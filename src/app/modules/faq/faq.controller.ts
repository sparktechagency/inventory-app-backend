import catchAsync from "../../../shared/catchAsync"
import { faqService } from "./faq.service"
import sendResponse from "../../../shared/sendResponse"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"

const createFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await faqService.createFaqIntoDB(req.body)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Faq created successfully",
        data: result
    })
})

const getAllFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await faqService.getAllFaqFromDB()
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Faq fetched successfully",
        data: result
    })
})

const updateFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await faqService.updateFaqIntoDB(req.params.id, req.body)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Faq updated successfully",
        data: result
    })
})

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await faqService.deleteFaqFromDB(req.params.id)
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Faq deleted successfully",
        data: result
    })
})      



export const faqController = {
    createFaq,
    getAllFaq,
    updateFaq,
    deleteFaq
}
