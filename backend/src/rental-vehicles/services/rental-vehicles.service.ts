import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleName } from 'src/common/enums/roles.enum';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { CreateRentalSelectionDto } from '../dto/create-rental-selection.dto';
import { UpdateRentalSelectionDto } from '../dto/update-rental-selection.dto';
import { RentalVehiclesRepository } from '../repositories/rental-vehicles.repository';

@Injectable()
export class RentalVehiclesService {
  constructor(
    private readonly rentalVehiclesRepository: RentalVehiclesRepository,
  ) {}

  async findAvailable() {
    return this.rentalVehiclesRepository.findAvailable();
  }

  async checkEligibility(claimId: string, user: JwtUser) {
    const claim =
      await this.rentalVehiclesRepository.findClaimWithPolicy(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    this.validateClaimAccess(claim.customerId, user);

    if (!claim.policy) {
      return {
        eligible: false,
        reason: 'No insurance policy is associated with this claim',
      };
    }

    if (claim.policy.status !== 'ACTIVE') {
      return {
        eligible: false,
        reason: 'The policy is not active',
      };
    }

    const eligibleCoverage = claim.policy.coverages.find(
      (coverage) => coverage.rentalVehicleEligible,
    );

    if (!eligibleCoverage) {
      return {
        eligible: false,
        reason: 'The policy does not include rental vehicle coverage',
      };
    }

    const vehicles = await this.rentalVehiclesRepository.findAvailable();

    return {
      eligible: true,
      policyId: claim.policy.id,
      policyNumber: claim.policy.policyNumber,
      coverageType: eligibleCoverage.coverageType,
      rentalVehicleLimit: eligibleCoverage.rentalVehicleLimit,
      vehicles,
    };
  }

  async createSelection(
    claimId: string,
    dto: CreateRentalSelectionDto,
    user: JwtUser,
  ) {
    const claim =
      await this.rentalVehiclesRepository.findClaimWithPolicy(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    this.validateClaimAccess(claim.customerId, user);

    if (!claim.policy) {
      throw new BadRequestException(
        'No insurance policy is associated with this claim',
      );
    }

    if (claim.policy.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Rental vehicle is not available because the policy is not active',
      );
    }

    const eligibleCoverage = claim.policy.coverages.find(
      (coverage) => coverage.rentalVehicleEligible,
    );

    if (!eligibleCoverage) {
      throw new BadRequestException(
        'The policy does not include rental vehicle coverage',
      );
    }

    if (claim.rentalVehicleSelection) {
      throw new BadRequestException(
        'A rental vehicle has already been selected for this claim',
      );
    }

    const rentalVehicle = await this.rentalVehiclesRepository.findById(
      dto.rentalVehicleId,
    );

    if (!rentalVehicle) {
      throw new NotFoundException('Rental vehicle not found');
    }

    if (!rentalVehicle.isAvailable) {
      throw new BadRequestException('Selected rental vehicle is not available');
    }

    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    if (endDate && endDate < startDate) {
      throw new BadRequestException(
        'Rental end date cannot be before start date',
      );
    }

    let estimatedTotal: number | undefined;

    if (endDate) {
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const rentalDays =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / millisecondsPerDay,
        ) || 1;

      estimatedTotal = rentalDays * rentalVehicle.dailyRate;

      if (
        eligibleCoverage.rentalVehicleLimit !== null &&
        eligibleCoverage.rentalVehicleLimit !== undefined &&
        estimatedTotal > eligibleCoverage.rentalVehicleLimit
      ) {
        throw new BadRequestException(
          `Estimated rental cost exceeds the policy rental vehicle limit of ${eligibleCoverage.rentalVehicleLimit}`,
        );
      }
    }

    return this.rentalVehiclesRepository.createSelection(
      claimId,
      rentalVehicle.id,
      {
        ...dto,
        dailyRate: rentalVehicle.dailyRate,
        estimatedTotal,
      },
    );
  }

  async findSelection(claimId: string, user: JwtUser) {
    const selection =
      await this.rentalVehiclesRepository.findSelectionByClaimId(claimId);

    if (!selection) {
      throw new NotFoundException('Rental vehicle selection not found');
    }

    this.validateClaimAccess(selection.claim.customerId, user);

    return selection;
  }

  async updateSelection(
    claimId: string,
    dto: UpdateRentalSelectionDto,
    user: JwtUser,
  ) {
    const selection =
      await this.rentalVehiclesRepository.findSelectionByClaimId(claimId);

    if (!selection) {
      throw new NotFoundException('Rental vehicle selection not found');
    }

    this.validateClaimAccess(selection.claim.customerId, user);

    if (selection.status === 'CANCELLED') {
      throw new BadRequestException(
        'Cancelled rental selection cannot be updated',
      );
    }

    let dailyRate = selection.dailyRate;
    let estimatedTotal = selection.estimatedTotal;

    if (dto.rentalVehicleId) {
      const rentalVehicle = await this.rentalVehiclesRepository.findById(
        dto.rentalVehicleId,
      );

      if (!rentalVehicle) {
        throw new NotFoundException('Rental vehicle not found');
      }

      if (!rentalVehicle.isAvailable) {
        throw new BadRequestException(
          'Selected rental vehicle is not available',
        );
      }

      dailyRate = rentalVehicle.dailyRate;
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : selection.startDate;

    const endDate = dto.endDate ? new Date(dto.endDate) : selection.endDate;

    if (endDate && endDate < startDate) {
      throw new BadRequestException(
        'Rental end date cannot be before start date',
      );
    }

    if (endDate) {
      const millisecondsPerDay = 1000 * 60 * 60 * 24;
      const rentalDays =
        Math.ceil(
          (endDate.getTime() - startDate.getTime()) / millisecondsPerDay,
        ) || 1;

      estimatedTotal = rentalDays * dailyRate;
    }

    return this.rentalVehiclesRepository.updateSelection(claimId, {
      ...dto,
      dailyRate,
      estimatedTotal,
    });
  }

  async cancelSelection(claimId: string, user: JwtUser) {
    const selection =
      await this.rentalVehiclesRepository.findSelectionByClaimId(claimId);

    if (!selection) {
      throw new NotFoundException('Rental vehicle selection not found');
    }

    this.validateClaimAccess(selection.claim.customerId, user);

    if (selection.status === 'CANCELLED') {
      throw new BadRequestException(
        'Rental vehicle selection is already cancelled',
      );
    }

    return this.rentalVehiclesRepository.cancelSelection(claimId);
  }

  private validateClaimAccess(customerId: string, user: JwtUser) {
    const allowedRoles = [
      RoleName.ADMIN,
      RoleName.CASE_MANAGER,
      RoleName.AUDITOR,
      RoleName.CUSTOMER,
    ];

    if (!allowedRoles.includes(user.role as RoleName)) {
      throw new UnauthorizedException('Unauthorized Access');
    }

    if (user.role === RoleName.CUSTOMER && customerId !== user.id) {
      throw new UnauthorizedException('Unauthorized Access');
    }
  }
}
