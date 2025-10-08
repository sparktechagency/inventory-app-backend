import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { applinkGeneratedService } from "./applinkGenerated.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createApplinkGenerated = catchAsync(
  async (req: Request, res: Response) => {
    const result = await applinkGeneratedService.createApplinkGeneratedInToDB(
      req.body
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Applink generated successfully",
      data: result,
    });
  }
);

const getApplinkGenerated = catchAsync(async (req: Request, res: Response) => {
  const result = await applinkGeneratedService.getApplinkGeneratedFromDB(
    req.params.type
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Applink generated successfully",
    data: result,
  });
});

export const applinkGeneratedController = {
  createApplinkGenerated,
  getApplinkGenerated,
};
