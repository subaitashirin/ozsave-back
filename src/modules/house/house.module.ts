import { Module } from '@nestjs/common';
import { HouseController } from './house.controller';
import { HouseService } from './services/house.service';

@Module({
  controllers: [HouseController],
  providers: [HouseService]
})
export class HouseModule {}
