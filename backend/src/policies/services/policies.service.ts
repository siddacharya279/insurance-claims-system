import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PolicyStatus } from '@prisma/client';
import { PoliciesRepository } from '../repositories/policies.repository';
import { CreatePolicyDto } from '../dto/create-policy.dto';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { UpdatePolicyDto } from '../dto/update-policy.dto';

@Injectable()
export class PoliciesService {
  constructor(private readonly policiesRepository: PoliciesRepository) {}

  async create(dto: CreatePolicyDto, user: JwtUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only admin users can create policies');
    }

    const existingPolicy = await this.policiesRepository.findByPolicyNumber(
      dto.policyNumber,
    );

    if (existingPolicy) {
      throw new ConflictException(
        'A policy with this policy number already exists',
      );
    }

    if (new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException(
        'Policy end date must be after the start date',
      );
    }

    return this.policiesRepository.create(dto);
  }

  async findAll(user: JwtUser) {
    if (user.role === 'ADMIN' || user.role === 'AUDITOR') {
      return this.policiesRepository.findAll();
    }

    if (user.role === 'CUSTOMER') {
      return this.policiesRepository.findByCustomerId(user.id);
    }

    throw new BadRequestException('You are not authorized to view policies');
  }

  async findById(id: string, user: JwtUser) {
    const policy = await this.policiesRepository.findById(id);

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (
      user.role !== 'ADMIN' &&
      user.role !== 'AUDITOR' &&
      policy.customerId !== user.id
    ) {
      throw new BadRequestException(
        'You are not authorized to view this policy',
      );
    }

    return policy;
  }

  async findMyPolicies(user: JwtUser) {
    if (user.role !== 'CUSTOMER') {
      throw new BadRequestException(
        'Only customer users can access their policies',
      );
    }

    return this.policiesRepository.findByCustomerId(user.id);
  }

  async findActiveForCustomer(customerId: string, user: JwtUser) {
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'AUDITOR' &&
      (user.role !== 'CUSTOMER' || user.id !== customerId)
    ) {
      throw new BadRequestException(
        'You are not authorized to view this policy',
      );
    }

    return this.policiesRepository.findActiveByCustomerId(customerId);
  }

  async update(id: string, dto: UpdatePolicyDto, user: JwtUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only admin users can update policies');
    }

    const policy = await this.policiesRepository.findById(id);

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (dto.policyNumber && dto.policyNumber !== policy.policyNumber) {
      const existingPolicy = await this.policiesRepository.findByPolicyNumber(
        dto.policyNumber,
      );

      if (existingPolicy) {
        throw new ConflictException(
          'A policy with this policy number already exists',
        );
      }
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : policy.startDate;

    const endDate = dto.endDate ? new Date(dto.endDate) : policy.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Policy end date must be after the start date',
      );
    }

    return this.policiesRepository.update(id, dto);
  }

  async cancel(id: string, user: JwtUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only admin users can cancel policies');
    }

    const policy = await this.policiesRepository.findById(id);

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (policy.status === PolicyStatus.CANCELLED) {
      throw new BadRequestException('Policy is already cancelled');
    }

    return this.policiesRepository.updateStatus(id, PolicyStatus.CANCELLED);
  }
}
