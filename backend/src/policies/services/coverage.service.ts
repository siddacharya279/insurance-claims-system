import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { CreateCoverageDto } from '../dto/create-coverage.dto';
import { UpdateCoverageDto } from '../dto/update-coverage.dto';
import { CoverageRepository } from '../repositories/coverage.repository';
import { PoliciesRepository } from '../repositories/policies.repository';

@Injectable()
export class CoverageService {
  constructor(
    private readonly coverageRepository: CoverageRepository,
    private readonly policiesRepository: PoliciesRepository,
  ) {}

  async create(policyId: string, dto: CreateCoverageDto, user: JwtUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only admin users can create coverage');
    }

    const policy = await this.policiesRepository.findById(policyId);

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (
      dto.rentalVehicleEligible &&
      (!dto.rentalVehicleLimit || dto.rentalVehicleLimit <= 0)
    ) {
      throw new BadRequestException(
        'Rental vehicle limit is required when rental vehicle coverage is enabled',
      );
    }

    return this.coverageRepository.create(policyId, dto);
  }

  async findById(id: string, user: JwtUser) {
    const coverage = await this.coverageRepository.findById(id);

    if (!coverage) {
      throw new NotFoundException('Coverage not found');
    }

    if (
      user.role !== 'ADMIN' &&
      user.role !== 'AUDITOR' &&
      coverage.policy.customerId !== user.id
    ) {
      throw new BadRequestException(
        'You are not authorized to view this coverage',
      );
    }

    return coverage;
  }

  async findByPolicyId(policyId: string, user: JwtUser) {
    const policy = await this.policiesRepository.findById(policyId);

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (
      user.role !== 'ADMIN' &&
      user.role !== 'AUDITOR' &&
      policy.customerId !== user.id
    ) {
      throw new BadRequestException(
        'You are not authorized to view this policy coverage',
      );
    }

    return this.coverageRepository.findByPolicyId(policyId);
  }

  async findRentalEligibleByPolicyId(policyId: string, user: JwtUser) {
    const policy = await this.policiesRepository.findById(policyId);

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (
      user.role !== 'ADMIN' &&
      user.role !== 'AUDITOR' &&
      policy.customerId !== user.id
    ) {
      throw new BadRequestException(
        'You are not authorized to view this policy coverage',
      );
    }

    return this.coverageRepository.findRentalEligibleByPolicyId(policyId);
  }

  async update(id: string, dto: UpdateCoverageDto, user: JwtUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only admin users can update coverage');
    }

    const coverage = await this.coverageRepository.findById(id);

    if (!coverage) {
      throw new NotFoundException('Coverage not found');
    }

    if (
      dto.rentalVehicleEligible === true &&
      (!dto.rentalVehicleLimit || dto.rentalVehicleLimit <= 0)
    ) {
      throw new BadRequestException(
        'Rental vehicle limit is required when rental vehicle coverage is enabled',
      );
    }

    return this.coverageRepository.update(id, dto);
  }

  async delete(id: string, user: JwtUser) {
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Only admin users can delete coverage');
    }

    const coverage = await this.coverageRepository.findById(id);

    if (!coverage) {
      throw new NotFoundException('Coverage not found');
    }

    return this.coverageRepository.delete(id);
  }
}
