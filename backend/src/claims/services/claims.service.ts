import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClaimsRepository } from '../repositories/claims.repository';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { RoleName } from 'src/common/enums/roles.enum';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { ClaimStatus } from '@prisma/client';
import { UpdateClaimStatusDto } from '../dto/update-claim-status.dto';
import { WorkshopsRepository } from 'src/workshops/repositories/workshops.repository';
import { AuditService } from 'src/audit/services/audit.service';

@Injectable()
export class ClaimsService {
  constructor(
    private readonly claimsRepository: ClaimsRepository,
    private readonly workshopsRepository: WorkshopsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(createClaimDto: CreateClaimDto, customerId: string) {
    const claimNumber = await this.generateClaimNumber();
    return this.claimsRepository.create({
      ...createClaimDto,
      customerId,
      claimNumber,
    });
  }

  private async generateClaimNumber(): Promise<string> {
    const count = await this.claimsRepository.count();
    const nextNumber = count + 1;
    const year = new Date().getFullYear();
    return `CLM-${year}-${nextNumber.toString().padStart(6, '0')}`;
  }

  async findAll(user: JwtUser) {
    switch (user.role) {
      case RoleName.ADMIN:
      case RoleName.CASE_MANAGER:
        return this.claimsRepository.findAll();
      case RoleName.CUSTOMER:
        return this.claimsRepository.findByCustomer(user.id);
      default:
        throw new UnauthorizedException('Unauthorized Access');
    }
  }

  async findById(claimId: string, user: JwtUser) {
    const claim = await this.claimsRepository.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    if (
      user.role === RoleName.ADMIN ||
      user.role === RoleName.CASE_MANAGER ||
      claim.customerId === user.id
    ) {
      return claim;
    }
    throw new UnauthorizedException('Unauthorized Access');
  }

  async updateClaimStatus(
    claimId: string,
    dto: UpdateClaimStatusDto,
    user: JwtUser,
  ) {
    const claim = await this.claimsRepository.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    const allowedRoles = [
      RoleName.ADMIN,
      RoleName.CASE_MANAGER,
      RoleName.ADJUSTER,
      RoleName.SURVEYOR,
      RoleName.WORKSHOP,
    ];
    if (!allowedRoles.includes(user.role as RoleName)) {
      throw new UnauthorizedException('Unauthorized Access');
    }

    if (!this.isRoleAllowedForTransition(user.role as RoleName, dto.status)) {
      throw new UnauthorizedException(
        'Role is not allowed to perform this transition',
      );
    }

    if (!this.isValidTransition(claim.status, dto.status)) {
      throw new BadRequestException('Invalid status transition');
    }

    const updatedClaim = await this.claimsRepository.updateClaimStatus(
      claimId,
      dto.status,
    );

    await this.auditService.recordClaimStatusChange(
      claimId,
      user.id,
      claim.status,
      dto.status,
    );

    return updatedClaim;
  }

  private isValidTransition(current: ClaimStatus, next: ClaimStatus): boolean {
    const validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
      SUBMITTED: [ClaimStatus.CASE_ASSIGNED],
      CASE_ASSIGNED: [ClaimStatus.SURVEY_PENDING],
      SURVEY_PENDING: [ClaimStatus.SURVEY_COMPLETED],
      SURVEY_COMPLETED: [ClaimStatus.ADJUDICATION_PENDING],
      ADJUDICATION_PENDING: [ClaimStatus.APPROVED, ClaimStatus.REJECTED],
      APPROVED: [ClaimStatus.REPAIR_IN_PROGRESS],
      REJECTED: [],
      REPAIR_IN_PROGRESS: [ClaimStatus.REPAIR_COMPLETED],
      REPAIR_COMPLETED: [ClaimStatus.PAYMENT_PENDING],
      PAYMENT_PENDING: [ClaimStatus.CLOSED],
      CLOSED: [],
    };
    return validTransitions[current].includes(next);
  }

  private isRoleAllowedForTransition(
    role: RoleName,
    next: ClaimStatus,
  ): boolean {
    if (role === RoleName.ADMIN) return true;
    if (role === RoleName.CASE_MANAGER) {
      return (
        [
          ClaimStatus.CASE_ASSIGNED,
          ClaimStatus.SURVEY_PENDING,
          ClaimStatus.ADJUDICATION_PENDING,
        ] as ClaimStatus[]
      ).includes(next);
    }

    if (role === RoleName.ADJUSTER) {
      return (
        [ClaimStatus.APPROVED, ClaimStatus.REJECTED] as ClaimStatus[]
      ).includes(next);
    }

    if (role === RoleName.WORKSHOP) {
      return (
        [
          ClaimStatus.REPAIR_IN_PROGRESS,
          ClaimStatus.REPAIR_COMPLETED,
        ] as ClaimStatus[]
      ).includes(next);
    }
    return false;
  }

  async assignWorkshop(claimId: string, workshopId: string, user: JwtUser) {
    const claim = await this.claimsRepository.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Claim not found');
    }
    const workshop = await this.workshopsRepository.findById(workshopId);
    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }
    if (!workshop.isActive) {
      throw new BadRequestException('Workshop is not active');
    }
    const allowedRoles = [
      RoleName.ADMIN,
      RoleName.CASE_MANAGER,
      RoleName.CUSTOMER,
    ];

    if (!allowedRoles.includes(user.role as RoleName)) {
      throw new UnauthorizedException('Unauthorized Access');
    }

    if (user.role === RoleName.CUSTOMER && user.id !== claim.customerId) {
      throw new UnauthorizedException('Unauthorized Access');
    }
    return this.claimsRepository.assignWorkshop(claimId, workshopId);
  }
}
