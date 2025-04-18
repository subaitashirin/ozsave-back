import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { House } from 'src/modules/house/house.model';
import { User } from '../../user/users.model';
import { IUser } from '../../user/users.interface';
import { COLLECTIONS } from 'src/common/config/consts';

@Injectable()
export class AdminService {

    constructor(
        @InjectModel(House.name) private readonly houseModel: Model<House>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectConnection() private readonly connection: mongoose.Connection,
    ) { }

    // search user by name or email
    async searchUserByNameOrEmail(search: string): Promise<Partial<User>[]> {
        const res = await this.userModel.find(
            {
                role: 'user',
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            },
            {
                name: 1,
                email: 1,
                house: 1,
                _id: 1,
            }
        );
        return res;
    }

    // send house invitation
    async sendHouseInvitation(userId: string, user: IUser) {

        // Start a session
        const session = await this.connection.startSession();
        try {
            // start transaction
            session.startTransaction();

            // admin can not invite himself
            if (userId === user._id.toString()) {
                throw new Error("Admin can not invite himself");
            }

            // check if user is already in a house
            const invitedUser = await this.userModel.findById(userId).session(session);

            // check if user is already exist
            if (!invitedUser) {
                throw new Error("User not found");
            }

            if (invitedUser?.house) {
                throw new Error("User already in a house");
            }

            // check if house exists
            const house = await this.houseModel.findById(user.house).session(session);
            if (!house) {
                throw new Error("House not found");
            }

            // check if user is already invited to the house
            const isAlreadyInvited = invitedUser?.houseInvitations.some(invite => invite?.toString() === house._id.toString());
            if (isAlreadyInvited) {
                throw new Error("User already invited to the house");
            }

            // update user to house invitations
            await this.userModel.updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                {
                    $push: { houseInvitations: house._id },
                },
                { session }
            );

            // update house invitations
            await this.houseModel.updateOne(
                { _id: new mongoose.Types.ObjectId(user.house) },
                {
                    $push: { memberInvitations: new mongoose.Types.ObjectId(userId) },
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

    // remove house invitation
    async removeHouseInvitation(userId: string, user: IUser) {

        // Start a session
        const session = await this.connection.startSession();
        try {

            // start transaction
            session.startTransaction();

            // check if user is already in a house
            const invitedUser = await this.userModel.findById(userId).session(session);

            // check if user is already exist
            if (!invitedUser) {
                throw new Error("User not found");
            }

            // check if house exists
            const house = await this.houseModel.findById(user.house).session(session);
            if (!house) {
                throw new Error("House not found");
            }

            // update user to house invitations
            await this.userModel.updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                {
                    $pull: { houseInvitations: house._id },
                },
                { session }
            );

            // update house invitations
            await this.houseModel.updateOne(
                { _id: new mongoose.Types.ObjectId(user.house) },
                {
                    $pull: { memberInvitations: new mongoose.Types.ObjectId(userId) },
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

    // remove user from house
    async removeUser(userId: string, user: IUser) {

        // Start a session
        const session = await this.connection.startSession();
        try {

            // start transaction
            session.startTransaction();

            // check if user is already in a house
            const member = await this.userModel.findById(userId).session(session);

            // check if user is already exist
            if (!member) {
                throw new Error("Member not found");
            }

            // check if house exists
            const house = await this.houseModel.findById(user.house).session(session);
            if (!house) {
                throw new Error("House not found");
            }

            // update user
            await this.userModel.updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                {
                    $set: {
                        house: null,
                        role: 'user', // default role
                    }
                },
                { session }
            );

            // update house
            await this.houseModel.updateOne(
                { _id: new mongoose.Types.ObjectId(user.house) },
                {
                    $pull: { members: new mongoose.Types.ObjectId(userId) },
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

    // hand over control
    async handoverControl(userId: string, user: IUser) {

        // Start a session
        const session = await this.connection.startSession();
        try {

            // start transaction
            session.startTransaction();

            // admin can not handover control to himself
            if (userId === user._id.toString()) {
                throw new Error("Admin can not handover control to himself");
            }

            const [res] = await this.userModel.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(userId),
                        house: new mongoose.Types.ObjectId(user.house),
                    },
                },
                {
                    $lookup: {
                        from: COLLECTIONS.houses,
                        let: { houseId: '$house', userId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$houseId'] },
                                            { $in: ['$$userId', '$members'] },
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

            // update current admin
            await this.userModel.updateOne(
                { _id: new mongoose.Types.ObjectId(user._id) },
                {
                    $set: {
                        role: 'user',
                    }
                },
                { session }
            );

            // update user
            await this.userModel.updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                {
                    $set: {
                        role: 'admin',
                    }
                },
                { session }
            );

            // update house
            await this.houseModel.updateOne(
                { _id: new mongoose.Types.ObjectId(user.house) },
                {
                    $set: { admin: new mongoose.Types.ObjectId(userId) },
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
}
