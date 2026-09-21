import { Module } from '@nestjs/common';
import { ClaimsModule } from '../claims/claims.module';
import { UsersModule } from '../users/users.module';
import { AdjudicationController } from './controllers/adjudication.controller';
import { AdjudicationRepository } from './repositories/adjudication.repository';
import { AdjudicationService } from './services/adjudication.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [ClaimsModule, UsersModule, NotificationsModule, AuditModule],
  controllers: [AdjudicationController],
  providers: [AdjudicationService, AdjudicationRepository],
})
export class AdjudicationModule {}
