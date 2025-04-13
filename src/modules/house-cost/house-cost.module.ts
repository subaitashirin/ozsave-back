import { Module } from '@nestjs/common';
import { HouseCostController } from './house-cost.controller';
import { HouseCostService } from './services/house-cost.service';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersModule } from '../users/user/users.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
  ],
  controllers: [HouseCostController],
  providers: [HouseCostService]
})
export class HouseCostModule { }
