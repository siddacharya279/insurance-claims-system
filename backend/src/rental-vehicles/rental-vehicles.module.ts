import { Module } from '@nestjs/common';
import { RentalVehiclesController } from './controllers/rental-vehicles.controller';
import { RentalVehiclesService } from './services/rental-vehicles.service';
import { RentalVehiclesRepository } from './repositories/rental-vehicles.repository';

@Module({
  controllers: [RentalVehiclesController],
  providers: [RentalVehiclesService, RentalVehiclesRepository],
  exports: [RentalVehiclesService],
})
export class RentalVehiclesModule {}
