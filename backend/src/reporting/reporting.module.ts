import { Module } from '@nestjs/common';
import { ReportingController } from './controllers/reporting.controller';
import { ReportingService } from './services/reporting.service';
import { ReportingRepository } from './repositories/reporting.repository';

@Module({
  controllers: [ReportingController],
  providers: [ReportingService, ReportingRepository],
  exports: [ReportingService],
})
export class ReportingModule {}
