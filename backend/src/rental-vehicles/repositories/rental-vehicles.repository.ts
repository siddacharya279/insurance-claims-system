import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRentalSelectionDto } from '../dto/create-rental-selection.dto';
import { UpdateRentalSelectionDto } from '../dto/update-rental-selection.dto';

@Injectable()
export class RentalVehiclesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rentalVehicle.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: [
        {
          vehicleType: 'asc',
        },
        {
          dailyRate: 'asc',
        },
      ],
    });
  }

  async findById(id: string) {
    return this.prisma.rentalVehicle.findUnique({
      where: {
        id,
      },
      include: {
        selections: true,
      },
    });
  }

  async findAvailable() {
    return this.prisma.rentalVehicle.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        dailyRate: 'asc',
      },
    });
  }

  async findClaimWithPolicy(claimId: string) {
    return this.prisma.claim.findUnique({
      where: {
        id: claimId,
      },
      include: {
        policy: {
          include: {
            coverages: true,
          },
        },
        rentalVehicleSelection: {
          include: {
            rentalVehicle: true,
          },
        },
      },
    });
  }

  async createSelection(
    claimId: string,
    rentalVehicleId: string,
    data: CreateRentalSelectionDto & {
      dailyRate: number;
      estimatedTotal?: number;
    },
  ) {
    return this.prisma.rentalVehicleSelection.create({
      data: {
        claimId,
        rentalVehicleId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        dailyRate: data.dailyRate,
        estimatedTotal: data.estimatedTotal,
        notes: data.notes,
      },
      include: {
        rentalVehicle: true,
        claim: true,
      },
    });
  }

  async findSelectionByClaimId(claimId: string) {
    return this.prisma.rentalVehicleSelection.findUnique({
      where: {
        claimId,
      },
      include: {
        rentalVehicle: true,
        claim: {
          include: {
            policy: {
              include: {
                coverages: true,
              },
            },
          },
        },
      },
    });
  }

  async updateSelection(
    claimId: string,
    data: UpdateRentalSelectionDto & {
      dailyRate?: number;
      estimatedTotal?: number | null;
    },
  ) {
    return this.prisma.rentalVehicleSelection.update({
      where: {
        claimId,
      },
      data: {
        rentalVehicleId: data.rentalVehicleId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        dailyRate: data.dailyRate,
        estimatedTotal: data.estimatedTotal,
        notes: data.notes,
      },
      include: {
        rentalVehicle: true,
        claim: true,
      },
    });
  }

  async cancelSelection(claimId: string) {
    return this.prisma.rentalVehicleSelection.update({
      where: {
        claimId,
      },
      data: {
        status: 'CANCELLED',
      },
      include: {
        rentalVehicle: true,
        claim: true,
      },
    });
  }
}
