import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/modules/users/user/services/users.service';
// import * as moment from 'moment-timezone';
import { DEFAULT_TIMEZONE } from 'src/common/config/timezone.config';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    if (request?.user) {
      const { _id } = request.user;
      const user = await this.userService.findFullUserById(_id);

      if(!user) {
        throw new NotFoundException("User not found");
      }
      
      user.timezone = DEFAULT_TIMEZONE;

      const isAutorized = roles?.includes(user.role);
      if(isAutorized) {
        context.switchToHttp().getRequest().user = user;
      }


      return isAutorized;
    }
    
    return false;
  }
}