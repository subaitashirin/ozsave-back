import { Types } from "mongoose";

export interface IHouseCostItem {
    _id?: string | Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    totalCost?: number;
    sharedBy: Types.ObjectId[];
}