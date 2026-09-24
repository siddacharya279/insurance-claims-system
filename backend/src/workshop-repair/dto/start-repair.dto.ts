import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class StartRepairDto {
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Expected repair delivery date',
    example: '2026-10-02T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}
