import mongoose, { Types } from 'mongoose';

export interface IFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
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
    items: mongoose.Types.ObjectId[];
    files?: File[];
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}