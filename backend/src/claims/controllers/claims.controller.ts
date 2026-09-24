import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClaimsService } from '../services/claims.service';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { UpdateClaimStatusDto } from '../dto/update-claim-status.dto';
import { AssignWorkshopDto } from '../dto/assign-workshop.dto';

@ApiTags('Claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new claim' })
  create(
    @Body() createClaimDto: CreateClaimDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.claimsService.create(createClaimDto, req.user.id);
  }
  @Get()
  @ApiOperation({ summary: 'Get all claims for the authenticated user' })
  findAll(@Request() req: { user: JwtUser }) {
    return this.claimsService.findAll(req.user);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a claim by ID' })
  findById(@Request() req: { user: JwtUser }, @Param('id') claimId: string) {
    return this.claimsService.findById(claimId, req.user);
  }
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status of a claim' })
  updateClaimStatus(
    @Request() req: { user: JwtUser },
    @Param('id') claimId: string,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    return this.claimsService.updateClaimStatus(claimId, dto, req.user);
  }
  @Patch(':id/assign-workshop')
  @ApiOperation({ summary: 'Assign a workshop to a claim' })
  assignWorkshop(
    @Request() req: { user: JwtUser },
    @Param('id') claimId: string,
    @Body() assignWorkshopDto: AssignWorkshopDto,
  ) {
    return this.claimsService.assignWorkshop(
      claimId,
      assignWorkshopDto.workshopId,
      req.user,
    );
  }
}
