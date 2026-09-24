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
import { CreateRentalSelectionDto } from '../dto/create-rental-selection.dto';
import { UpdateRentalSelectionDto } from '../dto/update-rental-selection.dto';
import { RentalVehiclesService } from '../services/rental-vehicles.service';

@Controller('rental-vehicles')
@UseGuards(JwtAuthGuard)
export class RentalVehiclesController {
  constructor(private readonly rentalVehiclesService: RentalVehiclesService) {}

  @Get()
  findAvailable() {
    return this.rentalVehiclesService.findAvailable();
  }

  @Get('claims/:claimId/eligibility')
  checkEligibility(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.checkEligibility(claimId, req.user);
  }

  @Post('claims/:claimId/selection')
  createSelection(
    @Param('claimId') claimId: string,
    @Body() dto: CreateRentalSelectionDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.createSelection(claimId, dto, req.user);
  }

  @Get('claims/:claimId/selection')
  findSelection(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.findSelection(claimId, req.user);
  }

  @Patch('claims/:claimId/selection')
  updateSelection(
    @Param('claimId') claimId: string,
    @Body() dto: UpdateRentalSelectionDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.updateSelection(claimId, dto, req.user);
  }

  @Delete('claims/:claimId/selection')
  cancelSelection(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.cancelSelection(claimId, req.user);
  }
}
