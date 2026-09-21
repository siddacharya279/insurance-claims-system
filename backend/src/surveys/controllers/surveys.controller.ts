import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { SurveysService } from '../services/surveys.service';
import { CreateSurveyDto } from '../dto/create-survey.dto';
import { JwtUser } from 'src/common/interfaces/jwt-user.interface';

@ApiTags('Surveys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @ApiOperation({
    summary: 'Create survey',
  })
  create(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveysService.create(createSurveyDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get survey by id',
  })
  findById(@Param('id') id: string) {
    return this.surveysService.findById(id);
  }

  @Get('claim/:claimId')
  @ApiOperation({
    summary: 'Get survey by claim id',
  })
  findByClaimId(@Param('claimId') claimId: string) {
    return this.surveysService.findByClaimId(claimId);
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: 'Complete survey',
  })
  complete(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    return this.surveysService.complete(id, req.user);
  }
}
