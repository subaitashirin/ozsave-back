import { Types } from "mongoose";

export interface IHouseCostItem {
    _id?: string | Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    totalCost: number;
    singleCost?: Types.ObjectId | null;
    houseCost?: Types.ObjectId | null;
    user: Types.ObjectId;
    house: Types.ObjectId;
}