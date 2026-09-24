import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCoverageDto } from '../dto/create-coverage.dto';
import { UpdateCoverageDto } from '../dto/update-coverage.dto';

@Injectable()
export class CoverageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(policyId: string, data: CreateCoverageDto) {
    return this.prisma.coverage.create({
      data: {
        policyId,
        coverageType: data.coverageType,
        coverageLimit: data.coverageLimit,
        deductible: data.deductible,
        rentalVehicleEligible: data.rentalVehicleEligible,
        rentalVehicleLimit: data.rentalVehicleLimit,
        description: data.description,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.coverage.findUnique({
      where: { id },
      include: {
        policy: true,
      },
    });
  }

  async findByPolicyId(policyId: string) {
    return this.prisma.coverage.findMany({
      where: { policyId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findRentalEligibleByPolicyId(policyId: string) {
    return this.prisma.coverage.findMany({
      where: {
        policyId,
        rentalVehicleEligible: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, data: UpdateCoverageDto) {
    return this.prisma.coverage.update({
      where: { id },
      data: {
        coverageType: data.coverageType,
        coverageLimit: data.coverageLimit,
        deductible: data.deductible,
        rentalVehicleEligible: data.rentalVehicleEligible,
        rentalVehicleLimit: data.rentalVehicleLimit,
        description: data.description,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.coverage.delete({
      where: { id },
    });
  }
}
