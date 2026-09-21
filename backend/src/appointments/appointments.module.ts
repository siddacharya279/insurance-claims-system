import { Module } from '@nestjs/common';

import { AppointmentsController } from './controllers/appointments.controller';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsRepository } from './repositories/appointments.repository';
import { ClaimsRepository } from 'src/claims/repositories/claims.repository';
import { WorkshopsRepository } from 'src/workshops/repositories/workshops.repository';

@Module({
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentsRepository,
    ClaimsRepository,
    WorkshopsRepository,
  ],
})
export class AppointmentsModule {}
