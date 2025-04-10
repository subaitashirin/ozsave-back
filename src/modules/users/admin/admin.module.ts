import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersModule } from 'src/modules/users/user/users.module';
import { HouseModule } from 'src/modules/house/house.module';

@Module({
  imports: [
        DatabaseModule,
        UsersModule,
        HouseModule
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
