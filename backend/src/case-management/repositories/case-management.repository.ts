import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CaseManagementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClaimId(claimId: string) {
    return this.prisma.caseAssignment.findUnique({
      where: { claimId },
      include: {
        caseManager: {
          select: {
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
          },
        },
        surveyor: {
          select: {
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
          },
        },
      },
    });
  }

  async assign(claimId: string, caseManagerId: string, surveyorId?: string) {
    return this.prisma.caseAssignment.upsert({
      where: { claimId },
      create: {
        claimId,
        caseManagerId,
        surveyorId,
      },
      update: {
        caseManagerId,
        surveyorId,
      },
      include: {
        caseManager: {
          select: {
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
          },
        },
        surveyor: {
          select: {
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
          },
        },
      },
    });
  }
}
