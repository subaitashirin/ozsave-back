import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { USER_ROLE } from './users.constant';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService: UsersService) { }

    @Get('search')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLE.user)
    async searchUserByNameOrEmail(@Query('search') search: string) {
        return this.usersService.searchUserByNameOrEmail(search);
    }
    
}
