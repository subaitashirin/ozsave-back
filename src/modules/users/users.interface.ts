import mongoose, { mongo } from "mongoose";
import { USER_ROLE } from "./users.constant";

export interface IUser {
	_id?: string;
	name: string;
	email: string;

	houseId?: mongoose.Types.ObjectId;

	role?: string;
	imageUrl?: string;
}

export interface IFullUser extends IUser {
	_id: string;
	role: string;

	houseId: mongoose.Types.ObjectId;

	timezone: string;
	createdAt: Date;
	updatedAt: Date;
}

export type TUserRole = keyof typeof USER_ROLE;