import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditRepository } from './repositories/audit.repository';

@Module({
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule {}
