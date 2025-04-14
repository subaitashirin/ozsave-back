import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { HouseCostService } from './services/house-cost.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_ROLE } from '../users/user/users.constant';
import { AddHouseCostDto, EditHouseCostDto } from './house.cost.validation';
import { ResponseMessage } from 'src/common/decorators/response_message.decorator';
import { AddSingleCostDto } from '../single-cost/single-cost.validation';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { IUser } from '../users/user/users.interface';
import { ValidateMongoId } from 'src/common/exception-filters/mongodbId.filters';

@ApiTags('House Cost')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('house-cost')
export class HouseCostController {

    constructor(
        private readonly houseCostService: HouseCostService
    ) { }

    @Post('add')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.user, USER_ROLE.admin)
    @ApiBody({ type: AddHouseCostDto })
    @ResponseMessage("House cost added successfully")
    async addSingleCost(
        @Body() body: AddHouseCostDto,
        @CurrentUser() user: IUser
    ) {
        return await this.houseCostService.addHouseCost(body, user);
    }

    @Put('edit/:costId')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.user, USER_ROLE.admin)
    @ApiBody({ type: EditHouseCostDto })
    @ResponseMessage("House cost updated successfully")
    async editSingleCost(
        @Body() body: EditHouseCostDto,
        @Param('costId', ValidateMongoId) costId: string,
        @CurrentUser() user: IUser
    ) {
        return await this.houseCostService.editHouseCost(body, costId, user);
    }
}
