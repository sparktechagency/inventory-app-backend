import { UNIT } from "../../../enums/units";


export interface IProduct {
    name: string;
    // price?: number;
    unit: UNIT;
    quantity: number;
    additionalInfo?: string;
}
