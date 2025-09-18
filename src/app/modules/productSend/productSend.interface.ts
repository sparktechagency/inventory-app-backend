import { Types } from "mongoose";

export interface IProductSendProduct {
    _id: Types.ObjectId;
    price: number;
    availability: boolean;
    isDraft?: boolean;
  }

export interface IProductSend {
  product: IProductSendProduct[];
  status: "pending" | "confirmed" | "received" | "delivered";
  retailer: Types.ObjectId | undefined;
  wholesaler: Types.ObjectId | undefined;
  isDeleted: boolean;
}

