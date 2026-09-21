import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    claimId?: string;
    actorUserId?: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    description?: string;
  }) {
    return this.prismaService.auditLog.create({
      data: {
        claimId: data.claimId,
        actorUserId: data.actorUserId,
        action: data.action,
        oldValue: data.oldValue,
        newValue: data.newValue,
        description: data.description,
      },
    });
  }

  async findByClaimId(claimId: string) {
    return this.prismaService.auditLog.findMany({
      where: { claimId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByActorUserId(actorUserId: string) {
    return this.prismaService.auditLog.findMany({
      where: { actorUserId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
