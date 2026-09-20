import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SurveyStatus } from '@prisma/client';

@Injectable()
export class SurveysRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    claimId: string;
    surveyorId: string;
    damageDescription: string;
    estimatedCost?: number;
  }) {
    return this.prisma.survey.create({
      data,
      include: {
        claim: true,
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

  async findById(id: string) {
    return this.prisma.survey.findUnique({
      where: {
        id,
      },
      include: {
        claim: true,
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

  async findByClaimId(claimId: string) {
    return this.prisma.survey.findUnique({
      where: {
        claimId,
      },
      include: {
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

  async updateStatus(id: string, status: SurveyStatus) {
    return this.prisma.survey.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
