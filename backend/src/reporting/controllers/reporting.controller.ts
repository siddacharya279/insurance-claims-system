import {
  Controller,
  Get,
  Query,
  Request,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportingService } from '../services/reporting.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { RoleName } from 'src/common/enums/roles.enum';

@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  private authorizeReportingAccess(user: JwtUser) {
    const allowedRoles = [
      RoleName.ADMIN,
      RoleName.CASE_MANAGER,
      RoleName.AUDITOR,
    ];

    if (!allowedRoles.includes(user.role as RoleName)) {
      throw new ForbiddenException(
        'You are not authorized to access reporting',
      );
    }
  }

  @Get('claims/status-summary')
  @ApiOperation({ summary: 'Get claim status summary' })
  async getClaimStatusSummary(@Request() req: { user: JwtUser }) {
    this.authorizeReportingAccess(req.user);

    return this.reportingService.getClaimStatusSummary();
  }

  @Get('claims/volume')
  @ApiOperation({ summary: 'Get claim volume by date' })
  async getClaimVolume(
    @Request() req: { user: JwtUser },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.authorizeReportingAccess(req.user);

    return this.reportingService.getClaimVolumeByDate(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('claims/adjudication-summary')
  @ApiOperation({ summary: 'Get claim adjudication summary' })
  async getAdjudicationSummary(@Request() req: { user: JwtUser }) {
    this.authorizeReportingAccess(req.user);

    return this.reportingService.getAdjudicationSummary();
  }

  @Get('claims/repair-payment-summary')
  @ApiOperation({ summary: 'Get repair and payment summary' })
  async getRepairPaymentSummary(@Request() req: { user: JwtUser }) {
    this.authorizeReportingAccess(req.user);

    return this.reportingService.getRepairPaymentSummary();
  }

  @Get('claims/average-processing-time')
  @ApiOperation({ summary: 'Get average claim processing time' })
  async getAverageProcessingTime(@Request() req: { user: JwtUser }) {
    this.authorizeReportingAccess(req.user);

    return this.reportingService.getAverageProcessingTime();
  }
}
