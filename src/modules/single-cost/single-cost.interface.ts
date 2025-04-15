import mongoose, { Types } from 'mongoose';

export interface IFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
}

export interface ISingleCost {
    _id?: string | mongoose.Types.ObjectId;
    storeName: string;
    date?: Date;
    items: mongoose.Types.ObjectId[];
    files?: File[];
    notes?: string | null;
    user: mongoose.Types.ObjectId;
    house: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}