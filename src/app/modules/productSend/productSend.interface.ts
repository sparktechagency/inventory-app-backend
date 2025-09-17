import { Types } from "mongoose";

export interface IProductSend {
    product: Types.ObjectId[] | undefined
    status: "pending" | "confirmed" | "received" | "delivered"
    retailer: Types.ObjectId | undefined
    wholesaler: Types.ObjectId | undefined
    isDeleted: boolean
}
