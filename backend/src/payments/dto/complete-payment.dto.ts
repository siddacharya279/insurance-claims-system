import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompletePaymentDto {
  @ApiProperty({
    example: 'TXN-2026-000001',
    description: 'External or simulated payment transaction reference',
  })
  @IsString()
  @IsNotEmpty()
  transactionReference!: string;
}
