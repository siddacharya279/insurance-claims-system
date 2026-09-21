import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { ClaimsModule } from 'src/claims/claims.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [ClaimsModule, NotificationsModule, AuditModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
