import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty({
    example: 'POL-2026-000001',
    description: 'Unique insurance policy number',
  })
  @IsString()
  @IsNotEmpty()
  policyNumber!: string;

  @ApiProperty({
    example: 'customer-user-id',
    description: 'Customer user ID',
  })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Policy start date',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Policy end date',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    example: 'YCompany Insurance',
    description: 'Insurance provider name',
  })
  @IsString()
  @IsNotEmpty()
  insurerName!: string;

  @ApiPropertyOptional({
    example: 'Maruti Suzuki',
    description: 'Vehicle manufacturer',
  })
  @IsOptional()
  @IsString()
  vehicleMake?: string;

  @ApiPropertyOptional({
    example: 'Swift',
    description: 'Vehicle model',
  })
  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @ApiPropertyOptional({
    example: 2024,
    description: 'Vehicle manufacturing year',
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  vehicleYear?: number;
}
