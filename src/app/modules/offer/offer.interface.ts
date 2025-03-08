import { Types } from "mongoose";
import { STATUS } from "../../../enums/status";



export interface IOrder {
    wholeSeller: Types.ObjectId | undefined;
    product: Types.ObjectId[] | undefined;
    retailer: Types.ObjectId | undefined;
    status: STATUS;
    availability?: boolean;
    price?: number
    Delivery: boolean
}
