import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { User } from 'src/modules/users/user/users.model';
import { HouseCost } from '../house-cost.model';
import { AddHouseCostDto, EditHouseCostDto } from '../house.cost.validation';
import { IUser } from 'src/modules/users/user/users.interface';
import { COLLECTIONS } from 'src/common/config/consts';
import { House } from 'src/modules/house/house.model';
import { SingleCost } from 'src/modules/single-cost/single-cost.model';
import { Console } from 'console';
import { IHouseCostItemDto } from '../house-cost.interface';
import { IItemCost } from 'src/modules/item-cost/item-cost.interface';
import { ItemCost } from 'src/modules/item-cost/item-cost.model';
import { TotalCost } from 'src/modules/total-cost/total-cost.model';

@Injectable()
export class HouseCostService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(House.name) private readonly houseModel: Model<House>,
        @InjectModel(ItemCost.name) private readonly itemCostModel: Model<ItemCost>,
        @InjectModel(TotalCost.name) private readonly totalCostModel: Model<TotalCost>,
        @InjectModel(HouseCost.name) private readonly houseCostModel: Model<HouseCost>,
        @InjectConnection() private readonly connection: mongoose.Connection,
    ) { }

    // add house cost
    async addHouseCost(body: AddHouseCostDto, user: IUser) {
        const session = await this.connection.startSession();

        try {
            session.startTransaction();

            // Step 1: Validate that user and all shared users are in the house
            const sharedUserIds = getUniqueUserIds(body.items.map(item => ({
                ...item,
                sharedBy: item.sharedBy.map(id => id.toString()),
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
                    }
                }
            ]);
            if (!res) throw new Error("Invalid request");

            const newHouseCostId = new mongoose.Types.ObjectId();

            const itemCostDocs: IItemCost[] = [];
            const houseCostItems: {
                itemIds: Types.ObjectId[];
                sharedBy: Types.ObjectId[];
            }[] = [];

            const totalCostDocs: any[] = [];
            const totalCostIds: Types.ObjectId[] = [];

            body.items.forEach((item) => {
                const { name, price, quantity, sharedBy } = item;
                const sharedByObjectIds = sharedBy.map(id => new Types.ObjectId(id));
                const itemIds: Types.ObjectId[] = [];

                const perUserPrice = parseFloat((price / sharedBy.length).toFixed(2));
                const totalPerUser = parseFloat((perUserPrice * quantity).toFixed(2));

                // Create ItemCost per user
                sharedBy.forEach((userId: string) => {
                    const _id = new Types.ObjectId();

                    itemCostDocs.push({
                        _id,
                        name,
                        price: perUserPrice,
                        quantity,
                        totalCost: totalPerUser,
                        user: new Types.ObjectId(userId),
                        house: new Types.ObjectId(user.house),
                        singleCost: null,
                        houseCost: newHouseCostId,
                    });

                    itemIds.push(_id);
                });

                // HouseCost.items entry
                houseCostItems.push({
                    itemIds,
                    sharedBy: sharedByObjectIds,
                });

                // TotalCost doc
                const totalCostId = new Types.ObjectId();
                totalCostIds.push(totalCostId);

                totalCostDocs.push({
                    _id: totalCostId,
                    name,
                    price,
                    quantity,
                    totalCost: parseFloat((price * quantity).toFixed(2)),
                    house: new Types.ObjectId(user.house),
                    houseCost: newHouseCostId,
                    item: {
                        itemIds,
                        sharedBy: sharedByObjectIds,
                    }
                });
            });

            // Insert ItemCosts
            await this.itemCostModel.insertMany(itemCostDocs, { session });

            // Insert TotalCosts
            await this.totalCostModel.insertMany(totalCostDocs, { session });

            // Insert HouseCost
            const newHouseCost = new this.houseCostModel({
                _id: newHouseCostId,
                storeName: body.storeName,
                date: new Date(),
                totalCosts: totalCostIds,
                items: houseCostItems,
                files: body.files || [],
                notes: body.notes || null,
                house: new mongoose.Types.ObjectId(user.house),
            });
            await newHouseCost.save({ session });

            // commit transaction
            await session.commitTransaction();
            session.endSession();
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    // edit house cost
    async editHouseCost(body: EditHouseCostDto, costId: string | Types.ObjectId, user: IUser) {

        const sharedUserIds = getUniqueUserIds(body.items.map(item => ({
            ...item,
            sharedBy: item.sharedBy.map(id => id.toString()),
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
        return res;
        if (!res) {
            throw new Error("Invalid request");
        }

        const oldSharedUserIds = getUniqueUserIds(res.items.map(item => ({
            ...item,
            sharedBy: item.sharedBy.map(id => new Types.ObjectId(id)),
        })));

        console.log(oldSharedUserIds, sharedUserIds);

        //     // Logic to calculate costs per user
        //     const costPerUserMap: Record<string, ISingleCostItem[]> = {};

        //     body.items.forEach((item: any) => {
        //         const { name, price, quantity, sharedBy } = item;
        //         item.totalCost = parseFloat((price * quantity).toFixed(2));
        //         const perUserCost = parseFloat((price / sharedBy.length).toFixed(2));

        //         sharedBy.forEach((userId: string) => {
        //             if (!costPerUserMap[userId]) {
        //                 costPerUserMap[userId] = [];
        //             }

        //             costPerUserMap[userId].push({
        //                 name,
        //                 price: perUserCost,
        //                 quantity,
        //                 totalCost: parseFloat((perUserCost * quantity).toFixed(2)),
        //             });
        //         });
        //     });

        //     const userCostArray = Object.entries(costPerUserMap).map(([userId, items]) => ({
        //         userId,
        //         items,
        //     }));

        //     return userCostArray;
    }
}

// common function

// get unique user ids
export const getUniqueUserIds = (...itemGroups: IHouseCostItemDto[][]): string[] => {
    const uniqueUserIds = new Set<string>();

    itemGroups.flat().forEach(item => {
        item.sharedBy.forEach(userId => uniqueUserIds.add(userId.toString()));
    });

    return Array.from(uniqueUserIds);
};

