import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  roleId: true,
  status: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AdjudicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClaimId(claimId: string) {
    return this.prisma.adjudication.findUnique({
      where: { claimId },
      include: {
        adjuster: {
          select: safeUserSelect,
        },
      },
    });
  }

  async findClaimForReview(claimId: string) {
    return this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        customer: {
          select: safeUserSelect,
        },
        documents: true,
        survey: {
          include: {
            surveyor: {
              select: safeUserSelect,
            },
          },
        },
        caseAssignment: {
          include: {
            caseManager: {
              select: safeUserSelect,
            },
            surveyor: {
              select: safeUserSelect,
            },
          },
        },
        workshop: true,
      },
    });
  }

  async create(data: {
    claimId: string;
    adjusterId: string;
    decision: 'APPROVED' | 'REJECTED';
    approvedAmount?: number;
    decisionReason: string;
  }) {
    return this.prisma.adjudication.create({
      data,
      include: {
        adjuster: {
          select: safeUserSelect,
        },
        claim: true,
      },
    });
  }
}
