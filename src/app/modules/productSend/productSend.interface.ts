import { Types } from "mongoose";

export interface IProductSend {
    product: Types.ObjectId[] | undefined
    status: "pending" | "confirm" | "received"
    retailer: Types.ObjectId | undefined
    wholesaler: Types.ObjectId | undefined
}
