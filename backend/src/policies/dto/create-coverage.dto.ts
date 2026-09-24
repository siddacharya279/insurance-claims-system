import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCoverageDto {
  @ApiProperty({
    example: 'COLLISION',
    description: 'Type of insurance coverage',
  })
  @IsString()
  @IsNotEmpty()
  coverageType!: string;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Maximum amount covered by this coverage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coverageLimit?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Customer deductible amount',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the customer is eligible for a rental vehicle',
  })
  @IsBoolean()
  rentalVehicleEligible!: boolean;

  @ApiPropertyOptional({
    example: 3000,
    description: 'Maximum rental vehicle coverage amount',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentalVehicleLimit?: number;

  @ApiPropertyOptional({
    example:
      'Collision damage coverage including eligible rental vehicle benefit.',
    description: 'Additional coverage details',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
