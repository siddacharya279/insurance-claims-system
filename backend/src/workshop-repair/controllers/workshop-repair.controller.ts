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
import { WorkshopRepairService } from '../services/workshop-repair.service';
import { CompleteRepairDto } from '../dto/complete-repair.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';
import { UpdateRepairDto } from '../dto/update-repair.dto';
import { StartRepairDto } from '../dto/start-repair.dto';

@ApiTags('Workshop Repair')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workshop-repair')
export class WorkshopRepairController {
  constructor(private readonly workshopRepairService: WorkshopRepairService) {}

  @Get('claim/:claimId')
  @ApiOperation({ summary: 'Get repair details by claim ID' })
  async getRepairByClaimId(
    @Request() req: { user: JwtUser },
    @Param('claimId') claimId: string,
  ) {
    return this.workshopRepairService.getRepairByClaimId(claimId, req.user);
  }

  @Get(':repairId')
  @ApiOperation({ summary: 'Get repair details by repair ID' })
  async getRepairById(
    @Request() req: { user: JwtUser },
    @Param('repairId') repairId: string,
  ) {
    return this.workshopRepairService.getRepairById(repairId, req.user);
  }

  @Post(':claimId/start')
  @ApiOperation({ summary: 'Start repair for an approved claim' })
  async startRepair(
    @Request() req: { user: JwtUser },
    @Param('claimId') claimId: string,
    @Body() dto: StartRepairDto,
  ) {
    const user = req.user;

    return this.workshopRepairService.startRepair(
      claimId,
      dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
      user,
    );
  }

  @Patch(':repairId')
  @ApiOperation({ summary: 'Update repair progress' })
  async updateRepair(
    @Request() req: { user: JwtUser },
    @Param('repairId') repairId: string,
    @Body() dto: UpdateRepairDto,
  ) {
    return this.workshopRepairService.updateRepair(
      repairId,
      dto.status,
      dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
      dto.repairNotes,
      req.user,
    );
  }

  @Post(':repairId/complete')
  @ApiOperation({ summary: 'Complete a repair' })
  async completeRepair(
    @Request() req: { user: JwtUser },
    @Param('repairId') repairId: string,
    @Body() dto: CompleteRepairDto,
  ) {
    const user = req.user;

    return this.workshopRepairService.completeRepair(
      repairId,
      dto.finalBillAmount,
      dto.repairNotes,
      user,
    );
  }
}
