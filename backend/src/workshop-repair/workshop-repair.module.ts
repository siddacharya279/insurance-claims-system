import { Module } from '@nestjs/common';
import { WorkshopRepairController } from './controllers/workshop-repair.controller';
import { WorkshopRepairService } from './services/workshop-repair.service';
import { WorkshopRepairRepository } from './repositories/workshop-repair.repository';
import { ClaimsModule } from 'src/claims/claims.module';
import { WorkshopsModule } from 'src/workshops/workshops.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [ClaimsModule, WorkshopsModule, NotificationsModule, AuditModule],
  controllers: [WorkshopRepairController],
  providers: [WorkshopRepairService, WorkshopRepairRepository],
})
export class WorkshopRepairModule {}
