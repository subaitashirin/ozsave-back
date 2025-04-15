import { Module } from '@nestjs/common';
import { ItemCostService } from './item-cost.service';

@Module({
  providers: [ItemCostService]
})
export class ItemCostModule {}
