import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

// house settings
// @Schema({ timestamps: false, _id: false, versionKey: false })
// export class HouseSettings {
// 	@Prop({ required: false, default: false })
// 	isInHouse: boolean;

// 	@Prop({ required: false, default: null })
// 	house: mongoose.Types.ObjectId;

// 	@Prop({ required: false, default: [] })
// 	houseMembers: mongoose.Types.ObjectId[];
// }

@Schema({ timestamps: true, autoIndex: true })
export class User {

	_id: string | mongoose.Types.ObjectId;

	@Prop({
		required: [true, 'Name is required'],
		minlength: [3, 'Name must be at least 3 characters long'],
		trim: true,
	})
	name: string;

	@Prop({ required: true, unique: true, trim: true, lowercase: true })
	email: string;

	@Prop({
		required: false,
		enum: {
			values: ['super-admin', 'admin', 'user'],
			message: 'Role is: super-admin, admin or user',
		},
		default: 'user',
	})
	role: string;

	@Prop({ required: false, default: null })
	imageUrl: string;

	@Prop({
		required: false,
		default: null,
		type: mongoose.Schema.Types.ObjectId,
		ref: 'House',
	})
	house: mongoose.Types.ObjectId;

	@Prop({
		required: false,
		default: [],
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'House',
	})
	houseInvitations: mongoose.Types.ObjectId[];

	createdAt: Date;
	updatedAt: Date;
	timezone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);