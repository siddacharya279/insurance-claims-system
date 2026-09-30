import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { AssignCaseDto } from '../dto/assign-case.dto';
import { CaseManagementService } from '../services/case-management.service';

@ApiTags('Case Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('case-management')
export class CaseManagementController {
  constructor(private readonly service: CaseManagementService) {}

  @Post('claims/:claimId/assign')
  @ApiOperation({
    summary: 'Assign a case manager and optionally a surveyor to a claim',
  })
  assign(
    @Param('claimId') claimId: string,
    @Body() dto: AssignCaseDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.service.assign(claimId, dto, req.user);
  }

  @Get('claims/:claimId')
  @ApiOperation({ summary: 'Get the case assignment for a claim' })
  getAssignment(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.service.getAssignment(claimId, req.user);
  }

  @Get('assignable-users')
  @ApiOperation({ summary: 'Get active users available for case assignment' })
  getAssignableUsers(@Request() req: { user: JwtUser }) {
    return this.service.getAssignableUsers(req.user);
  }
}
