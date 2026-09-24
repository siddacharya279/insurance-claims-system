import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CompleteRepairDto {
  @ApiProperty({
    type: Number,
    minimum: 0,
    description: 'Final repair bill amount',
    example: 44500,
  })
  @IsNumber()
  @Min(0)
  finalBillAmount!: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Additional notes about the completed repair',
    example: 'All damaged parts replaced and vehicle repair completed.',
  })
  @IsOptional()
  @IsString()
  repairNotes?: string;
}
