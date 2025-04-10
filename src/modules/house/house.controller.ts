import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { HouseService } from './services/house.service';
import { AddHouseDto } from './house.validation';
import { ResponseMessage } from 'src/common/decorators/response_message.decorator';
import { IFullUser } from '../users/users.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';

@ApiTags('House')
@Controller('house')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class HouseController {

    constructor(
        private readonly houseService: HouseService
    ) { }

    @Post('add')
    @UseGuards(RolesGuard)
    @Roles('user')
    @ApiBody({ type: AddHouseDto })
	@ResponseMessage("House added successfully")
    async addHouse(
        @Body() body: AddHouseDto,
		@CurrentUser() user: IFullUser
    ) {
        return await this.houseService.addHouse(body, user);
    }
}
