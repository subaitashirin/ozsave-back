import { Module } from '@nestjs/common';
import { TotalCostController } from './total-cost.controller';
import { TotalCostService } from './services/total-cost.service';

@Module({
  controllers: [TotalCostController],
  providers: [TotalCostService]
})
export class TotalCostModule {}
