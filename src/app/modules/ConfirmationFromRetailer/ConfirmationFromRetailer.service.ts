import { JwtPayload } from "jsonwebtoken";
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { SendOfferModelForRetailer } from "../sendOrder/sendOffer.model";

const updatePendingProductAsRetailerFromDB = async (id: string, payload: { quantity: number }, user: JwtPayload) => {
    const ids = typeof id === "string" ? id.split(",") : id;
    // console.log(ids);
    // Check quantity validity
    // if (typeof payload.quantity !== "number" || payload.quantity <= 0) {
    //     throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid quantity value");
    // }

    const offers = await ReplayFromWholesalerModel.find({
        _id: { $in: ids },
        retailer: user._id,
        status: "received",
    }).select("product");
    console.log(offers);


    const productIds = offers.map((offer) => offer.product);
    const updateResult = await SendOfferModelForRetailer.updateMany(
        { _id: { $in: productIds } },
        {
            $set: {
                quantity: payload.quantity,
                updatedAt: new Date(),
            },
        }
    );

    return updateResult;
}



const testFromDB = async (user: JwtPayload) => {
    const result = await ReplayFromWholesalerModel.find({ retailer: user.id })
    console.log(result)
    return result
}


export const confirmationFromRetailerService = {
    updatePendingProductAsRetailerFromDB,
    testFromDB
}
