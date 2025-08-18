import catchAsync from "../../../shared/catchAsync";
import { inviteLinkService } from "./inviteLink.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

const createInviteLink = catchAsync(async (req: Request, res: Response) => {
  const result = await inviteLinkService.createInviteLinkInToDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Successfully created invite link",
    data: result,
  });
});

const getSingleInviteLink = catchAsync(async (req: Request, res: Response) => {
  const result = await inviteLinkService.getSingleInviteLinkFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Successfully fetched invite link",
    data: result,
  });
});

const updateInviteLink = catchAsync(async (req: Request, res: Response) => {
  const result = await inviteLinkService.updateInviteLinkInDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Successfully updated invite link",
    data: result,
  });
});

const deleteInviteLink = catchAsync(async (req: Request, res: Response) => {
  const result = await inviteLinkService.deleteInviteLinkFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Successfully deleted invite link",
    data: result,
  });
});

export const inviteLinkController = {
  createInviteLink,
  getSingleInviteLink,
  updateInviteLink,
  deleteInviteLink,
};
