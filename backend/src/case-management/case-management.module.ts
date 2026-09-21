import { Module } from '@nestjs/common';
import { ClaimsModule } from 'src/claims/claims.module';
import { UsersModule } from 'src/users/users.module';
import { CaseManagementController } from './controllers/case-management.controller';
import { CaseManagementRepository } from './repositories/case-management.repository';
import { CaseManagementService } from './services/case-management.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [ClaimsModule, UsersModule, NotificationsModule, AuditModule],
  controllers: [CaseManagementController],
  providers: [CaseManagementService, CaseManagementRepository],
})
export class CaseManagementModule {}
