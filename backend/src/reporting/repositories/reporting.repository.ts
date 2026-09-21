import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getClaimStatusSummary() {
    const [totalClaims, claimsByStatus] = await Promise.all([
      this.prismaService.claim.count(),
      this.prismaService.claim.groupBy({
        by: ['status'],
        _count: {
          _all: true,
        },
      }),
    ]);

    return {
      totalClaims,
      claimsByStatus: claimsByStatus.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
    };
  }

  async getClaimVolumeByDate(startDate?: Date, endDate?: Date) {
    const where = {
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const claims = await this.prismaService.claim.findMany({
      where,
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const volume = new Map<string, number>();

    for (const claim of claims) {
      const date = claim.createdAt.toISOString().slice(0, 10);
      volume.set(date, (volume.get(date) ?? 0) + 1);
    }

    return Array.from(volume.entries()).map(([date, count]) => ({
      date,
      count,
    }));
  }

  async getAdjudicationSummary() {
    const [approved, rejected] = await Promise.all([
      this.prismaService.claim.count({
        where: {
          status: 'APPROVED',
        },
      }),
      this.prismaService.claim.count({
        where: {
          status: 'REJECTED',
        },
      }),
    ]);

    return {
      approved,
      rejected,
      totalAdjudicated: approved + rejected,
    };
  }

  async getRepairPaymentSummary() {
    const [repairInProgress, repairCompleted, paymentPending, closed] =
      await Promise.all([
        this.prismaService.claim.count({
          where: { status: 'REPAIR_IN_PROGRESS' },
        }),
        this.prismaService.claim.count({
          where: { status: 'REPAIR_COMPLETED' },
        }),
        this.prismaService.claim.count({
          where: { status: 'PAYMENT_PENDING' },
        }),
        this.prismaService.claim.count({
          where: { status: 'CLOSED' },
        }),
      ]);

    return {
      repairInProgress,
      repairCompleted,
      paymentPending,
      closed,
    };
  }

  async getAverageProcessingTime() {
    const closedClaims = await this.prismaService.claim.findMany({
      where: {
        status: 'CLOSED',
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    if (closedClaims.length === 0) {
      return {
        closedClaims: 0,
        averageProcessingTimeHours: 0,
      };
    }

    const totalMilliseconds = closedClaims.reduce(
      (total, claim) =>
        total + (claim.updatedAt.getTime() - claim.createdAt.getTime()),
      0,
    );

    const averageMilliseconds = totalMilliseconds / closedClaims.length;

    return {
      closedClaims: closedClaims.length,
      averageProcessingTimeHours: Number(
        (averageMilliseconds / (1000 * 60 * 60)).toFixed(2),
      ),
    };
  }
}
