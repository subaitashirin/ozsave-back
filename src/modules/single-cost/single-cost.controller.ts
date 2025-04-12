import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SingleCostService } from './services/single-cost.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AddSingleCostDto } from './single-cost.validation';
import { ResponseMessage } from 'src/common/decorators/response_message.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { IUser } from 'src/modules/users/user/users.interface';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_ROLE } from '../users/user/users.constant';

@ApiTags('SIngle Cost')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('single-cost')
export class SingleCostController {

    constructor(
        private readonly singleCostService: SingleCostService,
    ) { }

    @Post('add')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.user, USER_ROLE.admin)
    @ApiBody({ type: AddSingleCostDto })
    @ResponseMessage("Single cost added successfully")
    async addSingleCost(
        @Body() body: AddSingleCostDto,
        @CurrentUser() user: IUser
    ) {
        return await this.singleCostService.addSingleCost(body, user);
    }
}

