import { model, Schema } from "mongoose";
import { IAboutUsContactUsTermsAndConditions } from "./about-us-contact-us-terms-and-conditions.interface";

const aboutUsContactUsTermsAndConditionsSchema =
  new Schema<IAboutUsContactUsTermsAndConditions>(
    {
      body: { type: String, required: true },
      types: {
        type: String,
        enum: ["aboutUs", "contactUs", "termsAndConditions"],
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

export const aboutUsContactUsTermsAndConditionsModel =
  model<IAboutUsContactUsTermsAndConditions>(
    "AboutUsContactUsTermsAndConditions",
    aboutUsContactUsTermsAndConditionsSchema
  );
