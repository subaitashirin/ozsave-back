import { Types } from 'mongoose';

export interface IFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export interface IHouseItemCost {
    itemIds: Types.ObjectId[];
    sharedBy: Types.ObjectId[];
}

export interface IHouseCostItemDto {
    name: string;
    price: number;
    quantity: number;
    totalCost?: number;
    sharedBy: string[]; 
}

export interface IHouseCost {
    _id?: string | Types.ObjectId;
    storeName: string;
    date?: Date;
    items: IHouseItemCost[];
    files?: File[];
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}