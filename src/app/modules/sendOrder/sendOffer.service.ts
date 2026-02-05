import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ISendOffer } from "./sendOffer.interface";
import { SendOfferModelForRetailer } from "./sendOffer.model";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/QueryBuilder";

const createNewOrderIntoDB = async (user: JwtPayload, payload: ISendOffer) => {
  const result = await SendOfferModelForRetailer.create({
    ...payload,
    retailer: user.id,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create order");
  }
  return result;
};

// get all
const getAllNewOrdersFromDB = async (user: JwtPayload) => {
  const queryBuilder = await SendOfferModelForRetailer.find({
    retailer: user.id,
    status: false,
  });

  // for 1 hour ahead time display
  const updatedData = queryBuilder
    ?.map((doc: any) => {
      const obj = doc.toObject(); // Mongoose document -> plain object
      obj.createdAt = new Date(
        new Date(obj.createdAt).getTime() + 60 * 60 * 1000,
      );
      return obj;
    })
    .sort((first, sec) =>
      first.productName
        .toLowerCase()
        .localeCompare(sec.productName.toLowerCase()),
    );

  return {
    updatedData,
  };
};

const updateSingleProductIntoDB = async (
  id: string,
  user: JwtPayload,
  payload: any,
) => {
  const result = await SendOfferModelForRetailer.findByIdAndUpdate(
    { _id: id, retailer: user.id },
    payload,
    { new: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  return result;
};

// delete single or muliful order

const deleteSingleOrMulifulOrderIntoDB = async (
  id: string,
  user: JwtPayload,
) => {
  const result = await SendOfferModelForRetailer.findByIdAndDelete({
    _id: id,
    retailer: user.id,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  return result;
};

// all order history
const productHistoryFromDB = async (user: JwtPayload) => {
  // Fetch all documents from DB where status is true
  const result = await SendOfferModelForRetailer.find({
    retailer: user.id,
    status: true,
  });

  // Convert Mongoose documents to plain objects, filter out any without _id
  const updatedData = result
    .map((doc: any) => doc.toObject())
    .filter((doc: any) => doc._id) // only keep docs with _id
    .sort((a, b) =>
      a.productName.toLowerCase().localeCompare(b.productName.toLowerCase()),
    ); // case-insensitive alphabetical sort

  return {
    result: updatedData,
  };
};

// update history which is do status false and remove price and availability
const updateHistoryIntoDB = async (user: JwtPayload, id: string) => {
  const result = await SendOfferModelForRetailer.findByIdAndUpdate(
    { _id: id, retailer: user.id },
    { status: false, price: 0, availability: false },
    { new: true },
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  return result;
};
export const sendOfferService = {
  createNewOrderIntoDB,
  getAllNewOrdersFromDB,
  updateSingleProductIntoDB,
  deleteSingleOrMulifulOrderIntoDB,
  productHistoryFromDB,
  updateHistoryIntoDB,
};
