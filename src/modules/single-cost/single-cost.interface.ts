import mongoose, { Types } from 'mongoose';

export interface File {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export interface SingleCostItem {
    _id?: string | mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    cost: number;
}

export interface SingleCost {
    _id?: string | mongoose.Types.ObjectId;
    storeName: string;
    date?: Date;
    items: SingleCostItem[];
    files?: File[];
    notes?: string | null;
    user: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}