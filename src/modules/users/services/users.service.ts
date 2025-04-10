import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users.model';
import { Model } from 'mongoose';
import { isIn } from 'class-validator';

@Injectable()
export class UsersService {

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) { }

	// search user by name or email
	async searchUserByNameOrEmail(search: string): Promise<Partial<User>[]> {
		const res = await this.userModel.find(
			{
				$or: [
					{ name: { $regex: search, $options: 'i' } },
					{ email: { $regex: search, $options: 'i' } }
				]
			},
			{
				name: 1,
				email: 1,
				houseSettings: {
					isInHouse: 1,
				},
				_id: 0 // Optional: exclude _id
			}
		);
		return res;
	}

	async findFullUserById(id: string): Promise<User | undefined> {
		return this.userModel.findById(id).select('-__v -password');
	}
}
