import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClaimStatus, NotificationType, PaymentStatus } from '@prisma/client';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { ClaimsRepository } from 'src/claims/repositories/claims.repository';
import { PaymentsRepository } from '../repositories/payments.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { AuditService } from 'src/audit/services/audit.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly claimsRepository: ClaimsRepository,
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async getPaymentByClaimId(claimId: string, user: JwtUser) {
    if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
      throw new BadRequestException(
        'Only customer or admin users can view payment details',
      );
    }

    const payment = await this.paymentsRepository.findByClaimId(claimId);

    if (!payment) {
      throw new NotFoundException('Payment not found for this claim');
    }

    if (user.role === 'CUSTOMER' && payment.claim.customerId !== user.id) {
      throw new BadRequestException(
        'You are not authorized to view this payment',
      );
    }

    return payment;
  }

  async createPayment(claimId: string, paymentMethod: string, user: JwtUser) {
    if (user.role !== 'CUSTOMER') {
      throw new BadRequestException('Only customers can initiate payments');
    }

    const claim = await this.claimsRepository.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.customerId !== user.id) {
      throw new BadRequestException(
        'You are not authorized to pay for this claim',
      );
    }

    if (claim.status !== ClaimStatus.PAYMENT_PENDING) {
      throw new BadRequestException(
        'Payment can only be initiated for a claim in payment-pending status',
      );
    }

    const existingPayment =
      await this.paymentsRepository.findByClaimId(claimId);

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this claim');
    }

    if (!claim.repair) {
      throw new BadRequestException(
        'Completed repair details are required before payment',
      );
    }

    if (
      claim.repair.finalBillAmount === null ||
      claim.repair.finalBillAmount === undefined
    ) {
      throw new BadRequestException(
        'Final repair bill amount is not available',
      );
    }

    if (claim.repair.finalBillAmount < 0) {
      throw new BadRequestException(
        'Final repair bill amount cannot be negative',
      );
    }

    const payment = await this.paymentsRepository.create({
      claimId,
      amount: claim.repair.finalBillAmount,
      paymentMethod,
    });

    await this.auditService.record({
      claimId: claim.id,
      actorUserId: user.id,
      action: 'PAYMENT_CREATED',
      newValue: JSON.stringify({
        paymentId: payment.id,
        amount: payment.amount,
        paymentMethod,
      }),
      description: `Payment initiated for claim ${claim.claimNumber}`,
    });

    await this.notificationsService.create(
      claim.id,
      claim.customerId,
      NotificationType.PAYMENT_PENDING,
      `Payment is pending for claim ${claim.claimNumber}.`,
    );

    return payment;
  }

  async completePayment(
    paymentId: string,
    transactionReference: string,
    user: JwtUser,
  ) {
    if (user.role !== 'CUSTOMER' && user.role !== 'ADMIN') {
      throw new BadRequestException(
        'Only customer or admin users can complete payments',
      );
    }

    const payment = await this.paymentsRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (user.role === 'CUSTOMER' && payment.claim.customerId !== user.id) {
      throw new BadRequestException(
        'You are not authorized to complete this payment',
      );
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only a pending payment can be completed');
    }

    if (payment.claim.status !== ClaimStatus.PAYMENT_PENDING) {
      throw new BadRequestException('Claim is not awaiting payment');
    }

    const completedPayment = await this.prismaService.$transaction(
      async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: PaymentStatus.SUCCESS,
            transactionReference,
            paidAt: new Date(),
          },
        });

        await tx.claim.update({
          where: { id: payment.claimId },
          data: {
            status: ClaimStatus.CLOSED,
          },
        });

        return updatedPayment;
      },
    );

    await this.auditService.recordClaimStatusChange(
      payment.claimId,
      user.id,
      ClaimStatus.PAYMENT_PENDING,
      ClaimStatus.CLOSED,
    );

    await this.auditService.record({
      claimId: payment.claimId,
      actorUserId: user.id,
      action: 'PAYMENT_COMPLETED',
      newValue: JSON.stringify({
        paymentId: completedPayment.id,
        amount: completedPayment.amount,
        paymentMethod: completedPayment.paymentMethod,
        transactionReference,
        paidAt: completedPayment.paidAt,
      }),
      description: `Payment for claim ${payment.claim.claimNumber} completed`,
    });

    await this.notificationsService.create(
      payment.claimId,
      payment.claim.customerId,
      NotificationType.PAYMENT_COMPLETED,
      `Payment for claim ${payment.claim.claimNumber} has been completed.`,
    );

    return completedPayment;
  }
}
