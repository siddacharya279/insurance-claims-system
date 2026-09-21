import { Module } from '@nestjs/common';
import { SurveysService } from './services/surveys.service';
import { SurveysController } from './controllers/surveys.controller';
import { SurveysRepository } from './repositories/surveys.repository';
import { UsersModule } from 'src/users/users.module';
import { ClaimsModule } from 'src/claims/claims.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [UsersModule, ClaimsModule, NotificationsModule, AuditModule],
  providers: [SurveysService, SurveysRepository],
  controllers: [SurveysController],
})
export class SurveysModule {}
