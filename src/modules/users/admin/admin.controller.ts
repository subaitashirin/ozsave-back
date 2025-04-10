import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { ResponseMessage } from 'src/common/decorators/response_message.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { IFullUser } from '../user/users.interface';
import { Roles } from 'src/common/decorators/roles.decorator';
import { USER_ROLE } from '../user/users.constant';
import { ValidateMongoId } from 'src/common/exception-filters/mongodbId.filters';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AdminController {

    constructor(
        private readonly adminService: AdminService,
    ) { }

    @Put('invitation/:userId')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.admin)
    @ResponseMessage("Invite sent successfully")
    async inviteUser(
        @Param('userId', ValidateMongoId) userId: string,
        @CurrentUser() user: IFullUser
    ) {
        return await this.adminService.sendHouseInvitation(userId, user);
    }

    @Put('remove-invitation/:userId')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.admin)
    @ResponseMessage("Invitation removed successfully")
    async removeHouseInvitation(
        @Param('userId', ValidateMongoId) userId: string,
        @CurrentUser() user: IFullUser
    ) {
        return await this.adminService.removeHouseInvitation(userId, user);
    }

    // remove user from house
    @Put('remove-user/:userId')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.admin)
    @ResponseMessage("User removed successfully")
    async removeUser(
        @Param('userId', ValidateMongoId) userId: string,
        @CurrentUser() user: IFullUser
    ) {
        return await this.adminService.removeUser(userId, user);
    }
}
