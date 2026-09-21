import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkshopRepairRepository } from '../repositories/workshop-repair.repository';
import { ClaimsRepository } from 'src/claims/repositories/claims.repository';
import { WorkshopsRepository } from 'src/workshops/repositories/workshops.repository';
import { ClaimStatus, NotificationType, RepairStatus } from '@prisma/client';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { AuditService } from 'src/audit/services/audit.service';

@Injectable()
export class WorkshopRepairService {
  constructor(
    private readonly repairRepository: WorkshopRepairRepository,
    private readonly claimsRepository: ClaimsRepository,
    private readonly workshopRepository: WorkshopsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  private async assertWorkshopAccess(
    workshopId: string,
    user: JwtUser,
  ): Promise<void> {
    if (user.role !== 'WORKSHOP') {
      throw new ForbiddenException(
        'Only workshop users can access repair details',
      );
    }

    const workshopUser = await this.workshopRepository.findUserById(user.id);

    if (!workshopUser) {
      throw new ForbiddenException('Workshop user not found');
    }

    if (!workshopUser.workshopId) {
      throw new ForbiddenException(
        'Workshop user is not assigned to a workshop',
      );
    }

    if (workshopUser.workshopId !== workshopId) {
      throw new ForbiddenException(
        'You are not authorized to access this workshop repair',
      );
    }
  }

  async getRepairByClaimId(claimId: string, user: JwtUser) {
    const repair = await this.repairRepository.findByClaimId(claimId);

    if (!repair) {
      throw new NotFoundException('Repair not found for this claim');
    }

    await this.assertWorkshopAccess(repair.workshopId, user);

    return repair;
  }

  async getRepairById(repairId: string, user: JwtUser) {
    const repair = await this.repairRepository.findById(repairId);

    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    await this.assertWorkshopAccess(repair.workshopId, user);

    return repair;
  }

  async updateRepair(
    repairId: string,
    status: RepairStatus | undefined,
    expectedDeliveryDate: Date | undefined,
    repairNotes: string | undefined,
    user: JwtUser,
  ) {
    const repair = await this.repairRepository.findById(repairId);

    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    await this.assertWorkshopAccess(repair.workshopId, user);

    if (repair.claim.status !== ClaimStatus.REPAIR_IN_PROGRESS) {
      throw new BadRequestException(
        'Claim is not in repair-in-progress status',
      );
    }

    if (repair.status !== RepairStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Only an in-progress repair can be updated',
      );
    }

    if (status && status !== RepairStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Repair can only remain in progress. Use the complete repair endpoint to complete it.',
      );
    }

    return this.repairRepository.updateRepair(repairId, {
      status,
      expectedDeliveryDate,
      repairNotes,
    });
  }

  async startRepair(
    claimId: string,
    expectedDeliveryDate: Date | undefined,
    user: JwtUser,
  ) {
    if (user.role !== 'WORKSHOP') {
      throw new ForbiddenException('Only workshop users can start repairs');
    }

    const claim = await this.claimsRepository.findById(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== ClaimStatus.APPROVED) {
      throw new BadRequestException('Only an approved claim can start repair');
    }

    if (!claim.workshopId) {
      throw new BadRequestException('No workshop is assigned to this claim');
    }

    await this.assertWorkshopAccess(claim.workshopId, user);

    const existing = await this.repairRepository.findByClaimId(claimId);

    if (existing) {
      throw new BadRequestException('Repair already exists for this claim');
    }

    const workshop = await this.workshopRepository.findById(claim.workshopId);

    if (!workshop || !workshop.isActive) {
      throw new BadRequestException('Assigned workshop is not active');
    }

    const repair = await this.repairRepository.create({
      claimId,
      workshopId: claim.workshopId,
      expectedDeliveryDate,
    });

    await this.repairRepository.updateStatus(
      repair.id,
      RepairStatus.IN_PROGRESS,
      {
        startedAt: new Date(),
      },
    );

    await this.auditService.record({
      claimId: claim.id,
      actorUserId: user.id,
      action: 'REPAIR_STARTED',
      newValue: JSON.stringify({
        workshopId: claim.workshopId,
        expectedDeliveryDate: expectedDeliveryDate ?? null,
      }),
      description: `Repair for claim ${claim.claimNumber} started`,
    });

    await this.notificationsService.create(
      claim.id,
      claim.customerId,
      NotificationType.REPAIR_STARTED,
      `Repair for claim ${claim.claimNumber} has started.`,
    );

    await this.claimsRepository.updateClaimStatus(
      claimId,
      ClaimStatus.REPAIR_IN_PROGRESS,
    );

    await this.auditService.recordClaimStatusChange(
      claimId,
      user.id,
      ClaimStatus.APPROVED,
      ClaimStatus.REPAIR_IN_PROGRESS,
    );

    return this.repairRepository.findById(repair.id);
  }

  async completeRepair(
    repairId: string,
    finalBillAmount: number,
    repairNotes: string | undefined,
    user: JwtUser,
  ) {
    const repair = await this.repairRepository.findById(repairId);

    if (!repair) {
      throw new NotFoundException('Repair not found');
    }

    await this.assertWorkshopAccess(repair.workshopId, user);

    if (repair.claim.status !== ClaimStatus.REPAIR_IN_PROGRESS) {
      throw new BadRequestException(
        'Claim is not in repair-in-progress status',
      );
    }

    if (repair.status !== RepairStatus.IN_PROGRESS) {
      throw new BadRequestException('Repair is not in progress');
    }

    if (finalBillAmount < 0) {
      throw new BadRequestException('Final bill amount cannot be negative');
    }

    await this.repairRepository.updateStatus(repairId, RepairStatus.COMPLETED, {
      completedAt: new Date(),
      finalBillAmount,
      repairNotes,
    });

    await this.notificationsService.create(
      repair.claim.id,
      repair.claim.customerId,
      NotificationType.REPAIR_COMPLETED,
      `Repair for claim ${repair.claim.claimNumber} has been completed.`,
    );

    await this.claimsRepository.updateClaimStatus(
      repair.claimId,
      ClaimStatus.REPAIR_COMPLETED,
    );

    await this.auditService.recordClaimStatusChange(
      repair.claimId,
      user.id,
      ClaimStatus.REPAIR_IN_PROGRESS,
      ClaimStatus.REPAIR_COMPLETED,
    );

    await this.claimsRepository.updateClaimStatus(
      repair.claimId,
      ClaimStatus.PAYMENT_PENDING,
    );

    await this.auditService.recordClaimStatusChange(
      repair.claimId,
      user.id,
      ClaimStatus.REPAIR_COMPLETED,
      ClaimStatus.PAYMENT_PENDING,
    );

    await this.auditService.record({
      claimId: repair.claim.id,
      actorUserId: user.id,
      action: 'REPAIR_COMPLETED',
      newValue: JSON.stringify({
        finalBillAmount,
        repairNotes: repairNotes ?? null,
        completedAt: new Date(),
      }),
      description: `Repair for claim ${repair.claim.claimNumber} completed`,
    });

    return this.repairRepository.findById(repairId);
  }
}
