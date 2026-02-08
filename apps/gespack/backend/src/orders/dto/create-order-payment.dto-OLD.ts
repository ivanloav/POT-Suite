import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class CreateOrderPaymentDto {
  @IsNotEmpty()
  @IsInt()
  paymentTypeId: number;

  @IsOptional()
  @IsBoolean()
  isDeferred?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  scheduleCount?: number;

  @IsOptional()
  @IsString()
  holderName?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  // Cheque fields
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  // Card fields
  @IsOptional()
  @IsInt()
  cardTypeId?: number;

  @IsOptional()
  @IsNumber()
  cardNumber?: number;

  @IsOptional()
  @IsString()
  expirationDate?: string; // Format: MM/YY

  @IsOptional()
  @IsInt()
  securityCode?: number;
}
