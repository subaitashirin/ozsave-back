import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/modules/users/user/users.model';

export type HouseDocument = House & Document;

@Schema({ timestamps: true, autoIndex: true })
export class House {

	_id: string | mongoose.Types.ObjectId;

	@Prop({ type: String, required: true })
	name: string;

	@Prop({
		required: true,
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	})
	admin: mongoose.Types.ObjectId;

	@Prop({
		required: true,
		default: [],
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'User',
	})
	members: mongoose.Types.ObjectId[];

	createdAt: Date;
	updatedAt: Date;
}

export const HouseSchema = SchemaFactory.createForClass(House);
