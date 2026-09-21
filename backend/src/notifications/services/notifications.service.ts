import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsRepository } from '../repositories/notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(
    claimId: string,
    recipientUserId: string,
    type: NotificationType,
    message: string,
  ) {
    return this.notificationsRepository.create({
      claimId,
      recipientUserId,
      type,
      message,
    });
  }

  async findByUserId(userId: string) {
    return this.notificationsRepository.findByUserId(userId);
  }

  async findUnreadByUserId(userId: string) {
    return this.notificationsRepository.findUnreadByUserId(userId);
  }

  async markAsRead(id: string) {
    try {
      return await this.notificationsRepository.markAsRead(id);
    } catch {
      throw new NotFoundException('Notification not found');
    }
  }
}
