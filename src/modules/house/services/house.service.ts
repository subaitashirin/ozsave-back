import { BadRequestException, Injectable } from '@nestjs/common';
import { IHouse } from '../house.interface';
import { IUser } from 'src/modules/users/user/users.interface';
import { AddHouseDto } from '../house.validation';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { User } from 'src/modules/users/user/users.model';
import mongoose, { Model } from 'mongoose';
import { House } from '../house.model';
import e from 'express';
import { error } from 'console';


@Injectable()
export class HouseService {

    constructor(
        @InjectModel(House.name) private readonly houseModel: Model<House>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectConnection() private readonly connection: mongoose.Connection,
    ) { }

    // add house
    async addHouse(body: AddHouseDto, user: IUser) {

        // Start a session
        const session = await this.connection.startSession();
        try {
            // start transaction
            session.startTransaction();

            // check if user is already in a house
            if (user?.house) {
                throw new BadRequestException("User already in a house");
            }

            // add house
            const newHouse = new this.houseModel({
                name: body.name,
                admin: new mongoose.Types.ObjectId(user._id),
                members: [new mongoose.Types.ObjectId(user._id)],
            })
            const savedHouse = await newHouse.save({ session });

            // update user with house id
            await this.userModel.findByIdAndUpdate(
                user._id,
                {
                    // once house is created, the user becomes admin for the house
                    // so we need to update the user role to admin
                    // remove all house invitations as the user is now in a house
                    house: savedHouse._id,
                    houseInvitations: [],
                    role: 'admin',
                },
                { new: true, session }
            );

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
        }
        catch (error) {
            // Abort the transaction in case of an error
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}
