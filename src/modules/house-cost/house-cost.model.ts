import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type HouseCostDocument = HouseCost & Document;

@Schema({ timestamps: false, _id: false })
export class File {
    @Prop({ type: String, required: true })
    id: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    mimeType: string;

    @Prop({ type: Number, required: true })
    size: number;
}

const FileSchema = SchemaFactory.createForClass(File);

@Schema({ timestamps: false, autoIndex: true })
export class HouseCostItem {
    _id: string | mongoose.Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true, default: 1 })
    quantity: number;

    @Prop({ required: true })
    totalCost: number;

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true,
    })
    sharedBy: mongoose.Types.ObjectId[];
}

export const HouseCostItemSchema = SchemaFactory.createForClass(HouseCostItem);

@Schema({ timestamps: true, autoIndex: true })
export class HouseCost {
    @Prop({
        required: [true, 'Store name is required'],
        minlength: [3, 'Store name must be at least 3 characters long'],
        maxlength: [20, 'Store name must not be more than 20 characters long'],
        trim: true,
    })
    storeName: string;

    @Prop({ type: Date, default: Date.now })
    date: Date;

    @Prop({ type: [HouseCostItemSchema], required: true })
    items: HouseCostItem[];

    @Prop({ required: false, type: [FileSchema], default: [] })
    files: File[];

    @Prop({ required: false, default: null })
    notes: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
        required: true,
    })
    house: mongoose.Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

export const HouseCostSchema = SchemaFactory.createForClass(HouseCost);