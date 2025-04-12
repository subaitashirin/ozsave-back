import { Module } from '@nestjs/common';
import { SingleCostController } from './single-cost.controller';
import { SingleCostService } from './services/single-cost.service';
import { DatabaseModule } from 'src/common/database/database.module';
import { UsersModule } from 'src/modules/users/user/users.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
  ],
  controllers: [SingleCostController],
  providers: [SingleCostService]
})
export class SingleCostModule { }
