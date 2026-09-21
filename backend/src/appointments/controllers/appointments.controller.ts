import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AppointmentsService } from '../services/appointments.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';

@ApiBearerAuth()
@ApiTags('Appointments')
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new appointment for claim' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: { user: JwtUser },
  ) {
    return this.appointmentsService.createAppointment(
      createAppointmentDto,
      req.user,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by ID' })
  async findOne(@Param('id') id: string, @Req() req: { user: JwtUser }) {
    return this.appointmentsService.findById(id, req.user);
  }

  @Get('claim/:claimId')
  @ApiOperation({ summary: 'Get an appointment by claim ID' })
  async findByClaimId(
    @Param('claimId') claimId: string,
    @Req() req: { user: JwtUser },
  ) {
    return this.appointmentsService.findByClaimId(claimId, req.user);
  }
}
