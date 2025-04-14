import { Types } from 'mongoose';

export interface IFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export interface IHouseCostItem {
    _id?: string | Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    totalCost?: number;
    sharedBy: Types.ObjectId[];
}

export interface IHouseCost {
    _id?: string | Types.ObjectId;
    storeName: string;
    date?: Date;
    items: IHouseCostItem[];
    files?: File[];
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}