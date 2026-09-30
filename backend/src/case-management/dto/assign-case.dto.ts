import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignCaseDto {
  @ApiProperty({
    example: 'case-manager-user-id',
    required: false,
    description: 'Required only when an administrator assigns the case.',
  })
  @IsOptional()
  @IsString()
  caseManagerId?: string;

  @ApiProperty({
    example: 'surveyor-user-id',
    required: false,
  })
  @IsOptional()
  @IsString()
  surveyorId?: string;
}
