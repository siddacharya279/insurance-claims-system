import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ClaimsModule } from './claims/claims.module';
import { DocumentsModule } from './documents/documents.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SurveysModule } from './surveys/surveys.module';
import { CaseManagementModule } from './case-management/case-management.module';
import { AdjudicationModule } from './adjudication/adjudication.module';
import { WorkshopRepairModule } from './workshop-repair/workshop-repair.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { ReportingModule } from './reporting/reporting.module';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { PoliciesModule } from './policies/policies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    RolesModule,
    AuthModule,
    ClaimsModule,
    DocumentsModule,
    WorkshopsModule,
    AppointmentsModule,
    SurveysModule,
    CaseManagementModule,
    AdjudicationModule,
    WorkshopRepairModule,
    PaymentsModule,
    NotificationsModule,
    AuditModule,
    ReportingModule,
    HealthModule,
    PoliciesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
