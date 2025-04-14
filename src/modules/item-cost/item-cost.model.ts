import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: true, autoIndex: true })
export class ItemCost {

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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    })
    user: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
        required: true,
    })
    house: mongoose.Types.ObjectId;
}

export const ItemCostSchema = SchemaFactory.createForClass(ItemCost);
