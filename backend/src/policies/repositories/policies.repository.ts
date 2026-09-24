import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PolicyStatus } from '@prisma/client';
import { CreatePolicyDto } from '../dto/create-policy.dto';
import { UpdatePolicyDto } from '../dto/update-policy.dto';

@Injectable()
export class PoliciesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePolicyDto) {
    return this.prisma.policy.create({
      data: {
        policyNumber: data.policyNumber,
        customerId: data.customerId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        insurerName: data.insurerName,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        coverages: true,
      },
    });
  }

  async findAll() {
    return this.prisma.policy.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        coverages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.policy.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        coverages: true,
      },
    });
  }

  async findByPolicyNumber(policyNumber: string) {
    return this.prisma.policy.findUnique({
      where: { policyNumber },
    });
  }

  async findByCustomerId(customerId: string) {
    return this.prisma.policy.findMany({
      where: { customerId },
      include: {
        coverages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActiveByCustomerId(customerId: string) {
    return this.prisma.policy.findFirst({
      where: {
        customerId,
        status: PolicyStatus.ACTIVE,
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        coverages: true,
      },
      orderBy: {
        endDate: 'desc',
      },
    });
  }

  async update(id: string, data: UpdatePolicyDto) {
    return this.prisma.policy.update({
      where: { id },
      data: {
        policyNumber: data.policyNumber,
        customerId: data.customerId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        insurerName: data.insurerName,
        vehicleMake: data.vehicleMake,
        vehicleModel: data.vehicleModel,
        vehicleYear: data.vehicleYear,
      },
      include: {
        coverages: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.policy.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: PolicyStatus) {
    return this.prisma.policy.update({
      where: { id },
      data: { status },
      include: {
        coverages: true,
      },
    });
  }
}
