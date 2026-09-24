import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

import { RepairStatus } from '@prisma/client';

export class UpdateRepairDto {
  @ApiPropertyOptional({
    enum: RepairStatus,
    description: 'Current repair status',
    example: RepairStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(RepairStatus)
  status?: RepairStatus;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Expected repair delivery date',
    example: '2026-10-02T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Additional notes about the repair progress',
    example: 'Front bumper replaced and headlight assembly installed.',
  })
  @IsOptional()
  @IsString()
  repairNotes?: string;
}
