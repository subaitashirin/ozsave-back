import { Types } from "mongoose";

export interface ITotalItemCost {
    itemIds: Types.ObjectId[];
    sharedBy: Types.ObjectId[];
}

export interface IHouseCost {
    _id?: string | Types.ObjectId;
    storeName: string;
    date?: Date;
    item: ITotalItemCost;
    files?: File[];
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}