import { JwtPayload } from "jsonwebtoken";
import { ReplayFromWholesalerModel } from "./replayFromWholesaler.model";
import QueryBuilder from "../../builder/QueryBuilder";

//TODO: received request from wholesaler request product
const getAllReceivedRequestFromWholesalerFromDB = async (user: JwtPayload, query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(ReplayFromWholesalerModel.find({ status: "received", retailer: user.id }), query);
    const data = await queryBuilder.modelQuery;
    const pagination = await queryBuilder.getPaginationInfo();
    if (!data) {
        return { pagination, data: [] };
    }
    return { pagination, data };
}



export const replayFromWholesalerService = {
    getAllReceivedRequestFromWholesalerFromDB
}