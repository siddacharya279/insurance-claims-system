import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AuditRepository } from './repositories/audit.repository';
import { AuditController } from './controllers/audit.controller';

@Module({
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
  controllers: [AuditController],
})
export class AuditModule {}
