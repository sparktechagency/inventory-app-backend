import { Types } from "mongoose";

export interface IReplayFromWholesaler{
    product:Types.ObjectId[] | undefined
    status:"confirm" | "received"
    retailer:Types.ObjectId | undefined
    wholesaler:Types.ObjectId | undefined
}
