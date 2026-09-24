import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { CreateCoverageDto } from '../dto/create-coverage.dto';
import { UpdateCoverageDto } from '../dto/update-coverage.dto';
import { CoverageService } from '../services/coverage.service';

@Controller('coverages')
@UseGuards(JwtAuthGuard)
export class CoverageController {
  constructor(private readonly coverageService: CoverageService) {}

  @Post('policy/:policyId')
  create(
    @Param('policyId') policyId: string,
    @Body() dto: CreateCoverageDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.coverageService.create(policyId, dto, req.user);
  }

  @Get(':id')
  findById(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.coverageService.findById(id, req.user);
  }

  @Get('policy/:policyId')
  findByPolicyId(
    @Param('policyId') policyId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.coverageService.findByPolicyId(policyId, req.user);
  }

  @Get('policy/:policyId/rental-eligible')
  findRentalEligibleByPolicyId(
    @Param('policyId') policyId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.coverageService.findRentalEligibleByPolicyId(
      policyId,
      req.user,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCoverageDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.coverageService.update(id, dto, req.user);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.coverageService.delete(id, req.user);
  }
}
