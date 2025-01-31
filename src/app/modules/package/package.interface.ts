import { Model } from "mongoose";

export type IPackage = {
    name: string;
    description: string;
    price: number;
    duration: '1 month' | '3 months' | '6 months' | '1 year';
    features?: string[];
}
export type packageModel = Model<IPackage, Record<string, never>>;