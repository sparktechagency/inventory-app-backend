import { UNIT } from "../../../enums/units";


export interface IProduct {
    name: string;
    // price?: number;
    unit: UNIT;
    quantity: number;
    additionalInfo?: string;
    Delivery: boolean;
    availability: boolean;
    price?: number
}
