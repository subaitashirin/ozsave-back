import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({ timestamps: false, _id: false, autoIndex: true })
export class ItemCosts {
    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'ItemCost',
        required: true
    })
    itemIds: mongoose.Types.ObjectId[];

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: true
    })
    sharedBy: mongoose.Types.ObjectId[];
}
const ItemCostSchema = SchemaFactory.createForClass(ItemCosts);


@Schema({ timestamps: true, autoIndex: true })
export class TotalCost {

    _id: string | mongoose.Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true, default: 1 })
    quantity: number;

    @Prop({ required: true })
    totalCost: number;

    @Prop({ type: ItemCostSchema, required: true })
    item: ItemCosts;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HouseCost',
        required: false,
        default: null,
    })
    houseCost: mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'House',
        required: true,
    })
    house: mongoose.Types.ObjectId;
}

export const TotalCostSchema = SchemaFactory.createForClass(TotalCost);
