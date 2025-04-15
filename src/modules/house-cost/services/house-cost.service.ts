import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { User } from 'src/modules/users/user/users.model';
import { HouseCost } from '../house-cost.model';
import { AddHouseCostDto, EditHouseCostDto } from '../house.cost.validation';
import { IUser } from 'src/modules/users/user/users.interface';
import { COLLECTIONS } from 'src/common/config/consts';
import { House } from 'src/modules/house/house.model';
import { ISingleCostItem } from 'src/modules/single-cost/single-cost.interface';
import { SingleCost } from 'src/modules/single-cost/single-cost.model';
import { IHouseCostItem } from '../house-cost.interface';
import { Console } from 'console';

@Injectable()
export class HouseCostService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(House.name) private readonly houseModel: Model<House>,
        @InjectModel(SingleCost.name) private readonly singleCostModel: Model<SingleCost>,
        @InjectModel(HouseCost.name) private readonly houseCostModel: Model<HouseCost>,
        @InjectConnection() private readonly connection: mongoose.Connection,
    ) { }

    // add house cost
    async addHouseCost(body: AddHouseCostDto, user: IUser) {

        // Start a session
        const session = await this.connection.startSession();
        try {
            // start transaction
            session.startTransaction();

            // parsing sharedBy to array of ObjectId as unique values
            const sharedUserIds = getUniqueUserIds(body.items.map(item => ({
                ...item,
                sharedBy: item.sharedBy.map(id => new Types.ObjectId(id)),
            })));

            const [res] = await this.houseModel.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(user.house),
                        members: {
                            $all: [
                                new Types.ObjectId(user._id),
                                ...sharedUserIds.map(id => new Types.ObjectId(id))
                            ]
                        }
                    },
                },
            ]);
            if (!res) {
                throw new Error("Invalid request");
            }

            // Logic to calculate costs per user
            const costPerUserMap: Record<string, ISingleCostItem[]> = {};

            body.items.forEach((item: any) => {
                const { name, price, quantity, sharedBy } = item;
                item.totalCost = parseFloat((price * quantity).toFixed(2));
                const perUserCost = parseFloat((price / sharedBy.length).toFixed(2));

                sharedBy.forEach((userId: string) => {
                    if (!costPerUserMap[userId]) {
                        costPerUserMap[userId] = [];
                    }

                    costPerUserMap[userId].push({
                        name,
                        price: perUserCost,
                        quantity,
                        totalCost: parseFloat((perUserCost * quantity).toFixed(2)),
                    });
                });
            });

            const userCostArray = Object.entries(costPerUserMap).map(([userId, items]) => ({
                userId,
                items,
            }));

            // bulk insert into single cost
            const bulkOps = userCostArray.map(({ userId, items }) => ({
                insertOne: {
                    document: {
                        storeName: body.storeName,
                        date: new Date(),
                        items,
                        files: body.files || [],
                        notes: body.notes || null,
                        user: new Types.ObjectId(userId),
                        house: new Types.ObjectId(user.house),
                    },
                },
            }));
            await this.singleCostModel.bulkWrite(bulkOps, { session });

            // create house cost
            const newHouseCost = new this.houseCostModel({
                ...body,
                house: new mongoose.Types.ObjectId(user.house)
            });
            await newHouseCost.save({ session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            return userCostArray;
        }
        catch (error) {
            // Rollback the transaction in case of error
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    // edit house cost
    async editHouseCost(body: EditHouseCostDto, costId: string | Types.ObjectId, user: IUser) {

        const sharedUserIds = getUniqueUserIds(body.items.map(item => ({
            ...item,
            sharedBy: item.sharedBy.map(id => new Types.ObjectId(id)),
        })));

        console.log(sharedUserIds);

        const [res] = await this.houseModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(user.house),
                    members: {
                        $all: [
                            new Types.ObjectId(user._id),
                            ...sharedUserIds.map(id => new Types.ObjectId(id))
                        ]
                    }
                },
            },
            {
                $lookup: {
                    from: COLLECTIONS.houseCosts,
                    let: { houseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$house', '$$houseId'] },
                                        { $eq: ['$_id', new Types.ObjectId(costId)] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'cost',
                },
            },
            { $unwind: '$cost' },
            {
                $replaceRoot: {
                    newRoot: '$cost'
                },
            },
            {
                $project: {
                    _id: 0,
                    items: 1,
                }
            }
        ]);
        console.log(res);
        if (!res) {
            throw new Error("Invalid request");
        }

        const oldSharedUserIds = getUniqueUserIds(res.items.map(item => ({
            ...item,
            sharedBy: item.sharedBy.map(id => new Types.ObjectId(id)),
        })));

        console.log(oldSharedUserIds, sharedUserIds);

        // Logic to calculate costs per user
        const costPerUserMap: Record<string, ISingleCostItem[]> = {};

        body.items.forEach((item: any) => {
            const { name, price, quantity, sharedBy } = item;
            item.totalCost = parseFloat((price * quantity).toFixed(2));
            const perUserCost = parseFloat((price / sharedBy.length).toFixed(2));

            sharedBy.forEach((userId: string) => {
                if (!costPerUserMap[userId]) {
                    costPerUserMap[userId] = [];
                }

                costPerUserMap[userId].push({
                    name,
                    price: perUserCost,
                    quantity,
                    totalCost: parseFloat((perUserCost * quantity).toFixed(2)),
                });
            });
        });

        const userCostArray = Object.entries(costPerUserMap).map(([userId, items]) => ({
            userId,
            items,
        }));

        return userCostArray;
    }
}

// common function

// get unique user ids
export const getUniqueUserIds = (...itemGroups: IHouseCostItem[][]): string[] => {
    const uniqueUserIds = new Set<string>();

    itemGroups.flat().forEach(item => {
        item.sharedBy.forEach(userId => uniqueUserIds.add(userId.toString()));
    });

    return Array.from(uniqueUserIds);
};

