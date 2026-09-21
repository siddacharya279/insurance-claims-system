import { Module } from '@nestjs/common';
import { ClaimsController } from './controllers/claims.controller';
import { ClaimsService } from './services/claims.service';
import { ClaimsRepository } from './repositories/claims.repository';
import { WorkshopsRepository } from 'src/workshops/repositories/workshops.repository';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [ClaimsController],
  providers: [ClaimsService, ClaimsRepository, WorkshopsRepository],
  exports: [ClaimsRepository],
})
export class ClaimsModule {}
