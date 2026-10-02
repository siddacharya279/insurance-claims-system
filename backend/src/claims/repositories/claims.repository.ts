import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { ClaimStatus } from '@prisma/client';

@Injectable()
export class ClaimsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createClaimDto: CreateClaimDto & {
      customerId: string;
      claimNumber: string;
    },
  ) {
    return this.prismaService.claim.create({
      data: {
        title: createClaimDto.title,
        description: createClaimDto.description,
        incidentDate: new Date(createClaimDto.incidentDate),
        incidentLocation: createClaimDto.incidentLocation,
        policyId: createClaimDto.policyId,
        customerId: createClaimDto.customerId,
        claimNumber: createClaimDto.claimNumber,
      },
    });
  }

  async count() {
    return this.prismaService.claim.count();
  }

  async findAll() {
    return this.prismaService.claim.findMany({
      include: {
        customer: {
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

  async findByCustomer(customerId: string) {
    return this.prismaService.claim.findMany({
      where: { customerId },
      include: {
        customer: {
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

  async findById(claimId: string) {
    return this.prismaService.claim.findUnique({
      where: { id: claimId },
      include: {
        customer: {
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
        repair: true,
        caseAssignment: {
          include: {
            caseManager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            surveyor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async updateClaimStatus(claimId: string, status: ClaimStatus) {
    return this.prismaService.claim.update({
      where: { id: claimId },
      data: { status },
    });
  }

  async assignWorkshop(claimId: string, workshopId: string) {
    return this.prismaService.claim.update({
      where: { id: claimId },
      data: { workshopId },
      include: { workshop: true },
    });
  }

  async findBySurveyor(surveyorId: string) {
    return this.prismaService.claim.findMany({
      where: {
        caseAssignment: {
          surveyorId,
        },
      },
      include: {
        customer: true,
        policy: true,
        workshop: true,
        caseAssignment: {
          include: {
            surveyor: true,
            caseManager: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findForAdjudication() {
    return this.prismaService.claim.findMany({
      where: {
        status: {
          in: [
            ClaimStatus.SURVEY_COMPLETED,
            ClaimStatus.ADJUDICATION_PENDING,
            ClaimStatus.APPROVED,
            ClaimStatus.REJECTED,
          ],
        },
      },
      include: {
        customer: true,
        policy: true,
        workshop: true,
        caseAssignment: {
          include: {
            caseManager: true,
            surveyor: true,
          },
        },
        survey: true,
        adjudication: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByWorkshop(workshopId: string) {
    return this.prismaService.claim.findMany({
      where: {
        workshopId,
      },
      include: {
        customer: {
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
        repair: true,
        workshop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
