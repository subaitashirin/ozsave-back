import mongoose, { Types } from 'mongoose';

export interface IHouse {
    _id: string | mongoose.Types.ObjectId;
    name: string;
    admin: Types.ObjectId;
    members: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}