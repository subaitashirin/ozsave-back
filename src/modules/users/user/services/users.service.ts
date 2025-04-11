import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from '../users.model';
import mongoose, { Model, Types } from 'mongoose';
import { isIn } from 'class-validator';
import { IUser } from '../users.interface';
import { House } from 'src/modules/house/house.model';
import { COLLECTIONS, REFERENCE } from 'src/common/config/consts';
import { CLIENT_RENEG_LIMIT } from 'tls';

@Injectable()
export class UsersService {

	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
		@InjectModel(House.name) private readonly houseModel: Model<House>,
		@InjectConnection() private readonly connection: mongoose.Connection,
	) { }

	// accept invitations
	async acceptInvitation(house: string, user: IUser) {

		// Start a session
		const session = await this.connection.startSession();
		try {

			// start transaction
			session.startTransaction();

			// check if user is already in a house
			if (user?.house) {
				throw new Error("User already in a house");
			}

			const [res] = await this.userModel.aggregate([
				{
					$match: {
						_id: new Types.ObjectId(user._id),
						houseInvitations: {
							$in: [new Types.ObjectId(house)],
						},
					},
				},
				{
					$lookup: {
						from: COLLECTIONS.houses,
						let: { invitedHouseIds: '$houseInvitations' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $in: ['$_id', '$$invitedHouseIds'] },
											{ $eq: ['$_id', new Types.ObjectId(house)] },
										],
									},
								},
							},
						],
						as: 'house',
					},
				},
				{
					$project: {
						_id: 0,
						house: { $arrayElemAt: ['$house', 0] },
					},
				},
			]);
			if (!res) {
				throw new Error("Invalid request");
			}

			// update user to house invitations
			await this.userModel.updateOne(
				{ _id: new mongoose.Types.ObjectId(user._id) },
				{
					$pull: { houseInvitations: new mongoose.Types.ObjectId(house) },
					$set: { house: new mongoose.Types.ObjectId(house) }
				},
				{ session }
			);

			// update house invitations
			await this.houseModel.updateOne(
				{ _id: new mongoose.Types.ObjectId(house) },
				{
					$pull: { memberInvitations: new mongoose.Types.ObjectId(user._id) },
					$push: { members: new mongoose.Types.ObjectId(user._id) }
				},
				{ session }
			);

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();
		}
		catch (error) {
			// Rollback the transaction in case of error
			await session.abortTransaction();
			throw error;
		}
	}

	// reject invitations
	async declineInvitation(house: string, user: IUser) {

		// Start a session
		const session = await this.connection.startSession();
		try {

			// start transaction
			session.startTransaction();

			const [res] = await this.userModel.aggregate([
				{
					$match: {
						_id: new Types.ObjectId(user._id),
						houseInvitations: {
							$in: [new Types.ObjectId(house)],
						},
					},
				},
				{
					$lookup: {
						from: COLLECTIONS.houses,
						let: { invitedHouseIds: '$houseInvitations' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $in: ['$_id', '$$invitedHouseIds'] },
											{ $eq: ['$_id', new Types.ObjectId(house)] },
										],
									},
								},
							},
						],
						as: 'house',
					},
				},
				{
					$project: {
						_id: 1,
						house: { $arrayElemAt: ['$house', 0] },
					},
				},
			]);
			if (!res) {
				throw new Error("Invalid request");
			}

			await this.userModel.updateOne(
				{ _id: new mongoose.Types.ObjectId(user._id) },
				{
					$pull: { houseInvitations: new mongoose.Types.ObjectId(house) }
				},
				{ session }
			);

			await this.houseModel.updateOne(
				{ _id: new mongoose.Types.ObjectId(house) },
				{
					$pull: { memberInvitations: new mongoose.Types.ObjectId(user._id) }
				},
				{ session }
			);

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();
		}
		catch (error) {
			// Rollback the transaction in case of error
			await session.abortTransaction();
			throw error;
		}
	}

	// leave house
	async leaveHouse(user: IUser) {

		// Start a session
		const session = await this.connection.startSession();
		try {

			// start transaction
			session.startTransaction();

			const [res] = await this.userModel.aggregate([
				{
					$match: {
						_id: new Types.ObjectId(user._id),
						house: new Types.ObjectId(user.house),
					}
				},
				{
					$lookup: {
						from: COLLECTIONS.houses,
						let: { houseId: '$house' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ['$_id', '$$houseId'] },
										],
									},
								},
							},
						],
						as: 'house',
					},
				},
				{
					$project: {
						_id: 1,
						house: { $arrayElemAt: ['$house', 0] },
					},
				},

			])
			if (!res) {
				throw new Error("Invalid request");
			}

			// update user
			await this.userModel.updateOne(
				{ _id: new mongoose.Types.ObjectId(user._id) },
				{
					$set: { house: null }
				},
				{ session }
			);

			// update house
			await this.houseModel.updateOne(
				{ _id: new mongoose.Types.ObjectId(user.house) },
				{
					$pull: { members: new mongoose.Types.ObjectId(user._id) }
				},
				{ session }
			);

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();
		}
		catch (error) {
			// Rollback the transaction in case of error
			await session.abortTransaction();
			throw error;
		}
	}

	// common user functions
	async findFullUserById(id: string): Promise<User | undefined> {
		return this.userModel.findById(id).select('-__v -password');
	}
}
