import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClaimStatus, NotificationType } from '@prisma/client';

import { ClaimsRepository } from '../../claims/repositories/claims.repository';
import { RoleName } from '../../common/enums/roles.enum';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { UsersService } from '../../users/services/users.service';
import { AdjudicateClaimDto } from '../dto/adjudicate-claim.dto';
import { AdjudicationRepository } from '../repositories/adjudication.repository';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { AuditService } from 'src/audit/services/audit.service';

@Injectable()
export class AdjudicationService {
  constructor(
    private readonly repository: AdjudicationRepository,
    private readonly claimsRepository: ClaimsRepository,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  async getForReview(claimId: string, actor: JwtUser) {
    this.assertAdjudicator(actor);

    const claim = await this.repository.findClaimForReview(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status === ClaimStatus.SURVEY_COMPLETED) {
      await this.claimsRepository.updateClaimStatus(
        claimId,
        ClaimStatus.ADJUDICATION_PENDING,
      );

      await this.auditService.recordClaimStatusChange(
        claimId,
        actor.id,
        ClaimStatus.SURVEY_COMPLETED,
        ClaimStatus.ADJUDICATION_PENDING,
      );

      claim.status = ClaimStatus.ADJUDICATION_PENDING;
    }

    if (claim.status !== ClaimStatus.ADJUDICATION_PENDING) {
      throw new BadRequestException('Claim is not pending adjudication');
    }

    if (!claim.survey) {
      throw new BadRequestException(
        'Survey assessment is required before adjudication',
      );
    }

    return claim;
  }

  async adjudicate(claimId: string, dto: AdjudicateClaimDto, actor: JwtUser) {
    this.assertAdjudicator(actor);

    const claim = await this.repository.findClaimForReview(claimId);

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.status !== ClaimStatus.ADJUDICATION_PENDING) {
      throw new BadRequestException('Claim is not pending adjudication');
    }

    if (!claim.survey) {
      throw new BadRequestException(
        'Survey assessment is required before adjudication',
      );
    }

    const existing = await this.repository.findByClaimId(claimId);

    if (existing) {
      throw new BadRequestException('Claim has already been adjudicated');
    }

    if (dto.decision === ClaimStatus.APPROVED && dto.approvedAmount == null) {
      throw new BadRequestException(
        'Approved amount is required for an approved claim',
      );
    }

    if (dto.decision === ClaimStatus.REJECTED && dto.approvedAmount != null) {
      throw new BadRequestException(
        'Approved amount must not be supplied for a rejected claim',
      );
    }

    const adjudicator = await this.usersService.findById(actor.id);

    if (
      !adjudicator ||
      ![RoleName.ADJUSTER, RoleName.ADMIN].includes(
        adjudicator.role.name as RoleName,
      )
    ) {
      throw new UnauthorizedException(
        'Authenticated user is not authorized to adjudicate claims',
      );
    }

    const adjudication = await this.repository.create({
      claimId,
      adjusterId: actor.id,
      decision: dto.decision,
      approvedAmount: dto.approvedAmount,
      decisionReason: dto.decisionReason,
    });

    await this.claimsRepository.updateClaimStatus(claimId, dto.decision);

    await this.auditService.recordClaimStatusChange(
      claimId,
      actor.id,
      ClaimStatus.ADJUDICATION_PENDING,
      dto.decision,
    );

    await this.auditService.record({
      claimId: claim.id,
      actorUserId: actor.id,
      action:
        dto.decision === ClaimStatus.APPROVED
          ? 'ADJUDICATION_APPROVED'
          : 'ADJUDICATION_REJECTED',
      newValue: JSON.stringify({
        decision: dto.decision,
        approvedAmount: dto.approvedAmount ?? null,
        decisionReason: dto.decisionReason ?? null,
      }),
      description:
        dto.decision === ClaimStatus.APPROVED
          ? `Claim ${claim.claimNumber} approved by adjudicator`
          : `Claim ${claim.claimNumber} rejected by adjudicator`,
    });

    const notificationType =
      dto.decision === ClaimStatus.APPROVED
        ? NotificationType.CLAIM_APPROVED
        : NotificationType.CLAIM_REJECTED;

    const message =
      dto.decision === ClaimStatus.APPROVED
        ? `Claim ${claim.claimNumber} has been approved.`
        : `Claim ${claim.claimNumber} has been rejected.`;

    await this.notificationsService.create(
      claim.id,
      claim.customerId,
      notificationType,
      message,
    );

    return adjudication;
  }

  private assertAdjudicator(actor: JwtUser) {
    if (actor.role !== RoleName.ADJUSTER && actor.role !== RoleName.ADMIN) {
      throw new UnauthorizedException(
        'Only adjusters or administrators can adjudicate claims',
      );
    }
  }
}
