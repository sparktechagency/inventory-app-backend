import { Types } from "mongoose";

export interface IReplayFromWholesaler {
    product: Types.ObjectId | undefined
    status: "confirm" | "received"
    retailer: Types.ObjectId | undefined
    price: number,
    availability: boolean
    wholesaler: Types.ObjectId | undefined
}
