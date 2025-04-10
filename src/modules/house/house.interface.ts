import { Types } from 'mongoose';

export interface IHouse {
    _id: string | Types.ObjectId;
    name: string;
    admin: Types.ObjectId;
    members: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}