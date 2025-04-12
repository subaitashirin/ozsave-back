import { Injectable } from '@nestjs/common';
import mongoose, { Model, Types } from 'mongoose';
import { User } from 'src/modules/users/user/users.model';
import { SingleCost, SingleCostItem } from '../single-cost.model';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AddSingleCostDto } from '../single-cost.validation';
import { IUser } from 'src/modules/users/user/users.interface';
import { COLLECTIONS } from 'src/common/config/consts';

@Injectable()
export class SingleCostService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(SingleCost.name) private readonly singleCostModel: Model<SingleCost>,
        @InjectConnection() private readonly connection: mongoose.Connection,
    ) { }

    // add single cost
    async addSingleCost(body: AddSingleCostDto, user: IUser) {

        // Start a session
        const session = await this.connection.startSession();
        try {
            // start transaction
            session.startTransaction();

            // checks for user and house 
            const [res] = await this.userModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(user._id),
                        house: new Types.ObjectId(user.house),
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
                                            { $eq: ['$_id', new Types.ObjectId(user?.house)] },
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

            // add house calculation
            // code here

            // total cost per item
            body.items.forEach((item: SingleCostItem) => {
                item.totalCost = item.price * item.quantity;
            });

            // create single cost
            const newSingleCost = new this.singleCostModel({
                ...body,
                user: new mongoose.Types.ObjectId(user._id),
                house: new mongoose.Types.ObjectId(user.house)
            });
            await newSingleCost.save({ session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
        }
        catch (error) {
            // Rollback the transaction in case of an error
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}
