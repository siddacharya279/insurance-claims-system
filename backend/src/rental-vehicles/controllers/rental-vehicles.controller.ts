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
import { CreateRentalSelectionDto } from '../dto/create-rental-selection.dto';
import { UpdateRentalSelectionDto } from '../dto/update-rental-selection.dto';
import { RentalVehiclesService } from '../services/rental-vehicles.service';

@ApiTags('Rental Vehicles')
@ApiBearerAuth()
@Controller('rental-vehicles')
@UseGuards(JwtAuthGuard)
export class RentalVehiclesController {
  constructor(private readonly rentalVehiclesService: RentalVehiclesService) {}
  @Get()
  @ApiOperation({ summary: 'Get available rental vehicles' })
  findAvailable() {
    return this.rentalVehiclesService.findAvailable();
  }
  @Get('claims/:claimId/eligibility')
  @ApiOperation({ summary: 'Check rental vehicle eligibility for a claim' })
  checkEligibility(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.checkEligibility(claimId, req.user);
  }
  @Post('claims/:claimId/selection')
  @ApiOperation({ summary: 'Select a rental vehicle for a claim' })
  createSelection(
    @Param('claimId') claimId: string,
    @Body() dto: CreateRentalSelectionDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.createSelection(claimId, dto, req.user);
  }
  @Get('claims/:claimId/selection')
  @ApiOperation({ summary: 'Get the rental vehicle selection for a claim' })
  findSelection(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.findSelection(claimId, req.user);
  }
  @Patch('claims/:claimId/selection')
  @ApiOperation({ summary: 'Update the rental vehicle selection for a claim' })
  updateSelection(
    @Param('claimId') claimId: string,
    @Body() dto: UpdateRentalSelectionDto,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.updateSelection(claimId, dto, req.user);
  }
  @Delete('claims/:claimId/selection')
  @ApiOperation({ summary: 'Cancel the rental vehicle selection for a claim' })
  cancelSelection(
    @Param('claimId') claimId: string,
    @Request() req: { user: JwtUser },
  ) {
    return this.rentalVehiclesService.cancelSelection(claimId, req.user);
  }
}
