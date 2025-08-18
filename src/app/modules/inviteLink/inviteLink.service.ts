import ApiError from "../../../errors/ApiError";
import { IInviteLink } from "./inviteLink.interface";
import { InviteLinkModel } from "./inviteLink.model";
import { StatusCodes } from "http-status-codes";

const createInviteLinkInToDB = async (payload: IInviteLink) => {
  const result = await InviteLinkModel.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create invite link");
  }
  return result;
};

const getSingleInviteLinkFromDB = async (   ) => {
  const result = await InviteLinkModel.findOne({});
  if (!result) {
    return []
  }
  return result;
};

const updateInviteLinkInDB = async (
  id: string,
  payload: Partial<IInviteLink>
) => {
  const result = await InviteLinkModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update invite link");
  }
  return result;
};

const deleteInviteLinkFromDB = async (id: string) => {
  const result = await InviteLinkModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete invite link");
  }
  return result;
};

export const inviteLinkService = {
  createInviteLinkInToDB,
  getSingleInviteLinkFromDB,
  updateInviteLinkInDB,
  deleteInviteLinkFromDB,
};
