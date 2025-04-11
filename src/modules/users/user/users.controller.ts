import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { USER_ROLE } from './users.constant';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ValidateMongoId } from 'src/common/exception-filters/mongodbId.filters';
import { ResponseMessage } from 'src/common/decorators/response_message.decorator';
import { IFullUser } from './users.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Put('accept-invitation/:house')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.user)
    @ResponseMessage("Invitation accepted successfully")
    async acceptInvitation(
        @Param('house', ValidateMongoId) house: string,
        @CurrentUser() user: IFullUser
    ) {
        return await this.usersService.acceptInvitation(house, user);
    }

    @Put('decline-invitation/:house')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.user)
    @ResponseMessage("Invitation declined successfully")
    async declineInvitation(
        @Param('house', ValidateMongoId) house: string,
        @CurrentUser() user: IFullUser
    ) {
        return await this.usersService.declineInvitation(house, user);
    }
}
