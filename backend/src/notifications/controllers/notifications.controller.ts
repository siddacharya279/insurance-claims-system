import {
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { NotificationsService } from '../services/notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get()
  @ApiOperation({ summary: 'Get notifications for the authenticated user' })
  async getMyNotifications(@Request() req: { user: JwtUser }) {
    return this.notificationsService.findByUserId(req.user.id);
  }
  @Get('unread')
  @ApiOperation({
    summary: 'Get unread notifications for the authenticated user',
  })
  async getUnreadNotifications(@Request() req: { user: JwtUser }) {
    return this.notificationsService.findUnreadByUserId(req.user.id);
  }
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
