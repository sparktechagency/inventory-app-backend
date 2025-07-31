import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { ISendOffer } from "./sendOffer.interface";
import { SendOfferModelForRetailer } from "./sendOffer.model";
import { JwtPayload } from "jsonwebtoken";
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model";

const createNewOrderIntoDB = async (user: JwtPayload, payload: ISendOffer) => {
    const result = await SendOfferModelForRetailer.create({ ...payload, retailer: user.id })
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create order")
    }
    return result
}

// get all 
const getAllNewOrdersFromDB = async (user: JwtPayload) => {
    const result = await SendOfferModelForRetailer.find({ retailer: user.id, status: false })
    if (!result) {
        return []
    }
    return result
}




export const sendOfferService = {
    createNewOrderIntoDB,
    getAllNewOrdersFromDB
}