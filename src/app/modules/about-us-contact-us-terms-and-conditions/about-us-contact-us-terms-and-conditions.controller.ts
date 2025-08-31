import catchAsync from "../../../shared/catchAsync";
import { aboutUsContactUsTermsAndConditionsService } from "./about-us-contact-us-terms-and-conditions.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

const createAboutUsContactUsTermsAndConditionsIntoDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await aboutUsContactUsTermsAndConditionsService.createAboutUsContactUsTermsAndConditionsIntoDB(
        req.body
      );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "About Us Contact Us Terms And Conditions created successfully",
      data: result,
    });
  }
);

const getAllAboutUsContactUsTermsAndConditionsFromDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await aboutUsContactUsTermsAndConditionsService.getAllAboutUsContactUsTermsAndConditionsFromDB(
        req.params.type as string
      );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "About Us Contact Us Terms And Conditions fetched successfully",
      data: result,
    });
  }
);

const updateAboutUsContactUsTermsAndConditionsIntoDBController = catchAsync(
    async (req: Request, res: Response) => {
      const payload = {
        ...req.body,
        types: req.params.type,
      };
  
      const result =
        await aboutUsContactUsTermsAndConditionsService.updateAboutUsContactUsTermsAndConditionsIntoDB(
          req.params.id,
          payload
        );
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Updated successfully",
        data: result,
      });
    }
  );
export const aboutUsContactUsTermsAndConditionsController = {
  createAboutUsContactUsTermsAndConditionsIntoDBController,
  getAllAboutUsContactUsTermsAndConditionsFromDBController,
  updateAboutUsContactUsTermsAndConditionsIntoDBController,
};
