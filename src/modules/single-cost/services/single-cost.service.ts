import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/modules/users/user/users.model';
import { SingleCost } from '../single-cost.model';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AddSingleCostDto } from '../single-cost.validation';
import { IUser } from 'src/modules/users/user/users.interface';

@Injectable()
export class SingleCostService {

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(SingleCost.name) private readonly singleCostModel: Model<SingleCost>,
        @InjectConnection() private readonly connection: mongoose.Connection,
    ) { }

    // add single cost
    async addSingleCost(body: AddSingleCostDto, user: IUser) {
        console.log(body)
    }
}
