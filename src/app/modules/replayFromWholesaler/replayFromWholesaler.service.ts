import { JwtPayload } from "jsonwebtoken";
import { ReplayFromWholesalerModel } from "./replayFromWholesaler.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { SendOfferModelForRetailer } from "../sendOrder/sendOffer.model";

const getAllReceivedRequestFromWholesalerFromDB = async (user: JwtPayload, query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(
        ReplayFromWholesalerModel.find({ status: "received", retailer: user.id }).populate({
            select: "name email image createdAt updatedAt",
            path: "wholesaler"
        }).populate({
            select: "productName unit quantity additionalInfo createdAt updatedAt",
            path: "product"
        }),
        query
    );
    const rawData = await queryBuilder.modelQuery;
    const meta = await queryBuilder.getPaginationInfo();
    const groupedData: Record<string, any> = {};
    rawData.forEach((item: any) => {
        const wholesalerId = item.wholesaler._id.toString();
        if (!groupedData[wholesalerId]) {
            groupedData[wholesalerId] = {
                wholesaler: item.wholesaler,
                orders: [],
            };
        }

        // push only the relevant order info
        groupedData[wholesalerId].orders.push({
            _id: item._id,
            product: item.product,
            status: item.status,
            price: item.price,
            availability: item.availability,
            createdAt: item.createdAt,
        });
    });

    const groupedArray = Object.values(groupedData);

    return {
        meta,
        data: groupedArray,
    };
}

const updateRequestFromWholesalerAsRetailerForConfirm = async (user: JwtPayload, id: string) => {
    const result = await ReplayFromWholesalerModel.findByIdAndUpdate({ retailer: user.id, status: "received", _id: id }, { status: "confirm" }, { new: true });
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No received request found");
    }
    return result;
}



const updateSingleProductAsRetailer = async (user: JwtPayload, id: string) => {
    const result = await SendOfferModelForRetailer.findByIdAndUpdate({ retailer: user.id, _id: id }, { new: true })
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No product found");
    }
    return result
}







export const replayFromWholesalerService = {
    getAllReceivedRequestFromWholesalerFromDB,
    updateRequestFromWholesalerAsRetailerForConfirm,
    updateSingleProductAsRetailer
}