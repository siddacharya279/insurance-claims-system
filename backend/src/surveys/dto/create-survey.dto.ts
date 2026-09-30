import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSurveyDto {
  @ApiProperty({
    example: 'cmf8gk2mz0000abc123xyz456',
    description: 'Claim ID',
  })
  @IsString()
  claimId!: string;

  @ApiPropertyOptional({
    example: 'cmf8h9ab20000xyz789def123',
    description:
      'Surveyor User ID. Required when an administrator or case manager creates the survey. The assigned Surveyor is derived from the authenticated user.',
  })
  @IsOptional()
  @IsString()
  surveyorId?: string;

  @ApiProperty({
    example: 'Front bumper damaged. Left headlight broken. Hood dented.',
    description: 'Damage assessment',
  })
  @IsString()
  damageDescription!: string;

  @ApiPropertyOptional({
    example: 12500,
    description: 'Estimated repair cost',
  })
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;
}
