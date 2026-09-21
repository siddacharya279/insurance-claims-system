import { Injectable } from '@nestjs/common';
import { AuditRepository } from '../repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepository: AuditRepository) {}

  async record(data: {
    claimId?: string;
    actorUserId?: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    description?: string;
  }) {
    return this.auditRepository.create(data);
  }

  async recordClaimStatusChange(
    claimId: string,
    actorUserId: string,
    oldStatus: string,
    newStatus: string,
    description?: string,
  ) {
    return this.auditRepository.create({
      claimId,
      actorUserId,
      action: 'CLAIM_STATUS_CHANGED',
      oldValue: oldStatus,
      newValue: newStatus,
      description:
        description ?? `Claim status changed from ${oldStatus} to ${newStatus}`,
    });
  }

  async getByClaimId(claimId: string) {
    return this.auditRepository.findByClaimId(claimId);
  }

  async getByActorUserId(actorUserId: string) {
    return this.auditRepository.findByActorUserId(actorUserId);
  }
}
