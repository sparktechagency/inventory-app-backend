import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ISendOffer } from "./sendOffer.interface";
import { SendOfferModelForRetailer } from "./sendOffer.model";
import { JwtPayload } from "jsonwebtoken";
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model";
import QueryBuilder from "../../builder/QueryBuilder";

const createNewOrderIntoDB = async (user: JwtPayload, payload: ISendOffer) => {
    const result = await SendOfferModelForRetailer.create({ ...payload, retailer: user.id })
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create order")
    }
    return result
}

// get all 
const getAllNewOrdersFromDB = async (user: JwtPayload) => {

    const queryBuilder = new QueryBuilder(SendOfferModelForRetailer.find({ retailer: user.id, status: false }), {})
        .search(['productName'])
        .filter()
        .sort()
        .paginate()
        .fields()

    const result = await queryBuilder.modelQuery;
    const meta = await queryBuilder.getPaginationInfo();

    return {
        meta,
        result,
    };
}




export const sendOfferService = {
    createNewOrderIntoDB,
    getAllNewOrdersFromDB
}