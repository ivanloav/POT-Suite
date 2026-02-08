import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderPaymentDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @ApiProperty({ example: 12345 })
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @ApiProperty({ example: 1 })
  @IsNumber ()
  paymentTypeId: number;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  isDeferred: boolean;

  @ApiProperty({ example: 1, default: 1 })
  @IsNumber ()
  scheduleCount: number;

  @ApiProperty({ example: 'First name' })
  @IsOptional()
  @IsString()
  holderName?: string;

  @ApiProperty({ example: 100.50 })
  @IsNumber ()
  amount: number;

  @ApiProperty({ example: 'Bank of Examples' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '1234567890' })
  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber ()
  cardTypeId?: number;
  
  @ApiProperty({ example: '4111111111111111' })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiProperty({ example: '12/25' })
  @IsOptional()
  @IsString()
  expirationDate?: string; // Format: MM/YY

  @ApiProperty({ example: 123 })
  @IsOptional()
  @IsNumber ()
  securityCode?: number;

  @ApiProperty({ example: 'admin' })
  @IsString()
  createdBy: string;

  @ApiProperty({ example: '2025-08-14T12:00:00Z'})
  @IsString()
  createdAt: string;
}