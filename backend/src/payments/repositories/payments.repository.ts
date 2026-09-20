import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClaimId(claimId: string) {
    return this.prisma.payment.findUnique({
      where: { claimId },
      include: {
        claim: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        claim: true,
      },
    });
  }

  async create(data: {
    claimId: string;
    amount: number;
    paymentMethod: string;
  }) {
    return this.prisma.payment.create({
      data: {
        claimId: data.claimId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      },
      include: {
        claim: true,
      },
    });
  }

  async markSuccessful(id: string, transactionReference: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionReference,
        paidAt: new Date(),
      },
      include: {
        claim: true,
      },
    });
  }

  async markFailed(id: string, transactionReference?: string) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.FAILED,
        transactionReference,
      },
      include: {
        claim: true,
      },
    });
  }
}
