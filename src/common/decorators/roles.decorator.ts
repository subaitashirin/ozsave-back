import { SetMetadata } from '@nestjs/common';
import { TUserRole } from 'src/modules/users/user/users.interface';

export const Roles = (...requiredRoles: TUserRole[]) => SetMetadata('roles', requiredRoles);