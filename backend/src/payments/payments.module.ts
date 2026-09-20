import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PaymentsRepository } from './repositories/payments.repository';
import { ClaimsModule } from 'src/claims/claims.module';

@Module({
  imports: [ClaimsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
})
export class PaymentsModule {}
