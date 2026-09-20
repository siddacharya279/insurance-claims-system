import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CompletePaymentDto } from '../dto/complete-payment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('claim/:claimId')
  @ApiOperation({ summary: 'Get payment details for a claim' })
  async getPaymentByClaimId(
    @Request() req: { user: JwtUser },
    @Param('claimId') claimId: string,
  ) {
    return this.paymentsService.getPaymentByClaimId(claimId, req.user);
  }

  @Post(':claimId')
  @ApiOperation({ summary: 'Initiate payment for a claim' })
  async createPayment(
    @Request() req: { user: JwtUser },
    @Param('claimId') claimId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(
      claimId,
      dto.paymentMethod,
      req.user,
    );
  }

  @Post(':paymentId/complete')
  @ApiOperation({ summary: 'Complete a pending payment' })
  async completePayment(
    @Request() req: { user: JwtUser },
    @Param('paymentId') paymentId: string,
    @Body() dto: CompletePaymentDto,
  ) {
    return this.paymentsService.completePayment(
      paymentId,
      dto.transactionReference,
      req.user,
    );
  }
}
