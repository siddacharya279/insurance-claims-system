import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: 'ONLINE',
    description: 'Payment method used by the customer',
  })
  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;
}
