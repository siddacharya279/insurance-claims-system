import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateClaimDto {
  @ApiProperty({
    example: 'Front bumper damaged',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Another vehicle hit my car at a traffic signal.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: '2026-07-26T10:30:00.000Z',
  })
  @IsDateString()
  incidentDate!: string;

  @ApiProperty({
    example: 'Downtown, Seattle',
  })
  @IsString()
  @IsNotEmpty()
  incidentLocation!: string;

  @ApiProperty({
    example: 'policy-id',
    description: 'Insurance policy covering this claim',
  })
  @IsString()
  @IsNotEmpty()
  policyId!: string;
}
