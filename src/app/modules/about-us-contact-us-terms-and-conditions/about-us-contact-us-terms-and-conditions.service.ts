import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IAboutUsContactUsTermsAndConditions } from "./about-us-contact-us-terms-and-conditions.interface";
import { aboutUsContactUsTermsAndConditionsModel } from "./about-us-contact-us-terms-and-conditions.model";

const allowedTypes = [
  "aboutUs",
  "contactUs",
  "termsAndConditions",
  "privacyPolicy",
];
const validateType = (types: string) => {
  if (!allowedTypes.includes(types)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid type provided");
  }
};
const createAboutUsContactUsTermsAndConditionsIntoDB = async (
  payload: IAboutUsContactUsTermsAndConditions
) => {
  validateType(payload.types);

  const result = await aboutUsContactUsTermsAndConditionsModel.findOneAndUpdate(
    { types: payload.types },
    payload,
    { new: true, upsert: true }
  );

  return result;
};

const getAllAboutUsContactUsTermsAndConditionsFromDB = async (
  types: string
) => {
  validateType(types);
  const result = await aboutUsContactUsTermsAndConditionsModel.find({
    types: types,
  });
  if (!result) {
    return [];
  }
  return result;
};

const updateAboutUsContactUsTermsAndConditionsIntoDB = async (
  id: string,
  payload: IAboutUsContactUsTermsAndConditions
) => {
  validateType(payload.types);
  const result =
    await aboutUsContactUsTermsAndConditionsModel.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true }
    );
  return result;
};

export const aboutUsContactUsTermsAndConditionsService = {
  createAboutUsContactUsTermsAndConditionsIntoDB,
  getAllAboutUsContactUsTermsAndConditionsFromDB,
  updateAboutUsContactUsTermsAndConditionsIntoDB,
};
