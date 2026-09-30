import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { AdjudicateClaimDto } from '../dto/adjudicate-claim.dto';
import { AdjudicationService } from '../services/adjudication.service';
@ApiTags('Adjudication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('adjudication')
export class AdjudicationController {
  constructor(private readonly adjudicationService: AdjudicationService) {}
  @Get('claims/:claimId')
  @ApiOperation({ summary: 'Get claim, survey and documents for adjudication' })
  getForReview(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.adjudicationService.getForReview(claimId, req.user);
  }
  @Get('claims/:claimId/result')
  @ApiOperation({ summary: 'Get completed adjudication for a claim' })
  getResult(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.adjudicationService.getResult(claimId, req.user);
  }
  @Patch('claims/:claimId')
  @ApiOperation({ summary: 'Approve or reject a claim' })
  adjudicate(
    @Param('claimId') claimId: string,
    @Body() dto: AdjudicateClaimDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.adjudicationService.adjudicate(claimId, dto, req.user);
  }
}
