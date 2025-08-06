import { JwtPayload } from "jsonwebtoken";
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import QueryBuilder from "../../builder/QueryBuilder";
import { User } from "../user/user.model";
import { sendNotifications } from "../../../helpers/notificationsHelper";

const updatePendingProductAsRetailerFromDB = async (user: JwtPayload) => {
    const result = await ReplayFromWholesalerModel.updateMany(
        { retailer: user.id, status: "received" },
        { $set: { status: "confirm" } }
    );
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update product")
    }
    const updatedProducts = await ReplayFromWholesalerModel.find({
        retailer: user.id,
        status: "confirm",
    })
    const findThisUser = await User.findById(user.id)
    const wholesalerIds = updatedProducts.map((item) => item.wholesaler?.toString())
    const notificationPayload = {
        sender: user.id,
        receiver: wholesalerIds[0],
        message: `${findThisUser?.name} has confirmed the order id please check`,
    };
    await sendNotifications(notificationPayload);
    return updatedProducts
}


const getAllConfrimRequestFromRetailerIntoDB = async (user: JwtPayload, query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(ReplayFromWholesalerModel.find({ wholesaler: user.id, status: "confirm" }), query)
    const result = await queryBuilder.modelQuery;
    const meta = await queryBuilder.getPaginationInfo();
    return {
        meta,
        result,
    }
}



const testFromDB = async (user: JwtPayload) => {
    const result = await ReplayFromWholesalerModel.find({ retailer: user.id })
    console.log(result)
    return result
}


export const confirmationFromRetailerService = {
    updatePendingProductAsRetailerFromDB,
    getAllConfrimRequestFromRetailerIntoDB,
    testFromDB
}
