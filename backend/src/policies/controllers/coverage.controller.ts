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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { CreateCoverageDto } from '../dto/create-coverage.dto';
import { UpdateCoverageDto } from '../dto/update-coverage.dto';
import { CoverageService } from '../services/coverage.service';

@ApiTags('Coverages')
@ApiBearerAuth()
@Controller('coverages')
@UseGuards(JwtAuthGuard)
export class CoverageController {
  constructor(private readonly coverageService: CoverageService) {}
  @Post('policy/:policyId')
  @ApiOperation({ summary: 'Create coverage for an insurance policy' })
  create(
    @Param('policyId') policyId: string,
    @Body() dto: CreateCoverageDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.coverageService.create(policyId, dto, req.user);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get coverage by ID' })
  findById(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.coverageService.findById(id, req.user);
  }
  @Get('policy/:policyId')
  @ApiOperation({ summary: 'Get all coverages for a policy' })
  findByPolicyId(
    @Param('policyId') policyId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.coverageService.findByPolicyId(policyId, req.user);
  }
  @Get('policy/:policyId/rental-eligible')
  @ApiOperation({ summary: 'Get rental-eligible coverages for a policy' })
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
  @ApiOperation({ summary: 'Update coverage' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCoverageDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.coverageService.update(id, dto, req.user);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete coverage' })
  delete(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.coverageService.delete(id, req.user);
  }
}
