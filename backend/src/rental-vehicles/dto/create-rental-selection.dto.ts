import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRentalSelectionDto {
  @ApiProperty({
    example: 'rental-vehicle-id',
    description: 'Rental vehicle selected for the claim',
  })
  @IsString()
  @IsNotEmpty()
  rentalVehicleId!: string;

  @ApiProperty({
    example: '2026-09-25T00:00:00.000Z',
    description: 'Rental start date',
  })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({
    example: '2026-09-28T00:00:00.000Z',
    description: 'Expected rental end date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: 'Customer requested rental vehicle during repair period.',
    description: 'Additional rental notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
