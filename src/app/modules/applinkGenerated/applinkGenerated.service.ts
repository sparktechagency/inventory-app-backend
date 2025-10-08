import { model, Schema } from "mongoose";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

export interface IApplinkGenerated {
  link: string;
  type: "android" | "ios";
}

const createApplinkGeneratedSchema = new Schema<IApplinkGenerated>({
  link: { type: String, required: true },
  type: { type: String, required: true },
});

const ApplinkGeneratedModel = model<IApplinkGenerated>(
  "ApplinkGenerated",
  createApplinkGeneratedSchema
);

// validation
const allowedTypes = ["android", "ios"];

const validateType = (type: string) => {
  if (!allowedTypes.includes(type)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid type provided");
  }
};

// SERVICE

const createApplinkGeneratedInToDB = async (payload: IApplinkGenerated) => {
  validateType(payload.type);
  //   if this type already exists, then replace it or don't have any type then create
  const result = await ApplinkGeneratedModel.findOneAndUpdate(
    { type: payload.type },
    payload,
    { new: true, upsert: true }
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Failed to create ${payload.type} generated`
    );
  }
  return result;
};

const getApplinkGeneratedFromDB = async (type: string) => {
  const result = await ApplinkGeneratedModel.findOne({ type });
  if (!result) {
    return [];
  }
  return result;
};



export const applinkGeneratedService = {
  createApplinkGeneratedInToDB,
  getApplinkGeneratedFromDB
};
