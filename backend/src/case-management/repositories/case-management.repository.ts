import { Injectable } from '@nestjs/common';
import { RoleName } from 'src/common/enums/roles.enum';

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

  async findAssignableUsers() {
    return this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        role: {
          name: {
            in: [RoleName.CASE_MANAGER, RoleName.SURVEYOR],
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { role: { name: 'asc' } },
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    });
  }
}
