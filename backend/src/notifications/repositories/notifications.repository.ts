import { Injectable } from '@nestjs/common';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    claimId: string;
    recipientUserId: string;
    type: NotificationType;
    message: string;
  }) {
    return this.prismaService.notification.create({
      data: {
        claimId: data.claimId,
        recipientUserId: data.recipientUserId,
        type: data.type,
        message: data.message,
      },
    });
  }

  async findByUserId(recipientUserId: string) {
    return this.prismaService.notification.findMany({
      where: {
        recipientUserId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findUnreadByUserId(recipientUserId: string) {
    return this.prismaService.notification.findMany({
      where: {
        recipientUserId,
        status: NotificationStatus.UNREAD,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(id: string, recipientUserId: string) {
    return this.prismaService.notification.update({
      where: {
        id,
        recipientUserId,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
  }
}
