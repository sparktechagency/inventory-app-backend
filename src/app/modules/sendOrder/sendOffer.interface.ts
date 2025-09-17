import { Types } from "mongoose";
import { UNIT } from "../../../enums/units";

export interface ISendOffer {
    productName: string
    unit: UNIT
    quantity: number
    additionalInfo?: string
    retailer: Types.ObjectId | undefined
    status: boolean
    price?: number
    availability?: boolean
    isDraft?: boolean
}