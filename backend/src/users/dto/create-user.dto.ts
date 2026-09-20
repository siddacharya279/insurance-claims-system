import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'User password',
    minLength: 8,
  })
  @MinLength(8)
  password!: string;

  @ApiProperty({
    example: '9876543210',
    description: 'Mobile number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'a-role-uuid',
    description: 'Role ID',
  })
  @IsUUID()
  roleId!: string;
}
