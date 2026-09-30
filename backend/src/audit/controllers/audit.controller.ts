import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { RoleName } from 'src/common/enums/roles.enum';
import { AuditService } from '../services/audit.service';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
  @Get('claims/:claimId')
  @ApiOperation({ summary: 'Get audit history for a claim' })
  async getClaimAudit(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    const allowedRoles = [
      RoleName.ADMIN,
      RoleName.AUDITOR,
      RoleName.CASE_MANAGER,
    ];
    if (!allowedRoles.includes(req.user.role as RoleName)) {
      throw new ForbiddenException(
        'You are not authorized to access audit records',
      );
    }
    return this.auditService.getByClaimId(claimId);
  }
}
