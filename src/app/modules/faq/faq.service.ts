import { IFaq } from "./faq.interface";
import { faqModel } from "./faq.model";

const createFaqIntoDB = async (payload: IFaq) => {
  const result = await faqModel.create(payload);
  if (!result) {
    throw new Error("Failed to create faq");
  }
  return result;
};

const getAllFaqFromDB = async () => {
  const result = await faqModel.find();
  if (!result) {
    return [];
  }
  return result;
};

const updateFaqIntoDB = async (id: string, payload: IFaq) => {
  const result = await faqModel.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error("Failed to update faq");
  }
  return result;
};

const deleteFaqFromDB = async (id: string) => {
  const result = await faqModel.findByIdAndDelete(id);
  if (!result) {
    throw new Error("Failed to delete faq");
  }
  return result;
};

export const faqService = {
  createFaqIntoDB,
  getAllFaqFromDB,
  updateFaqIntoDB,
  deleteFaqFromDB,
};
