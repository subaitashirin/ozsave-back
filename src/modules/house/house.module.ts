import { Module } from '@nestjs/common';
import { HouseController } from './house.controller';
import { HouseService } from './services/house.service';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    DatabaseModule,
		UsersModule,
  ],
  controllers: [HouseController],
  providers: [HouseService]
})
export class HouseModule {}
