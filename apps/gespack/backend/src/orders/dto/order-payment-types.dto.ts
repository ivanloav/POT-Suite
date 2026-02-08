import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsString, IsBoolean, IsNumber } from 'class-validator';
import { OrderPaymentTypeFieldsDto } from './order-payment-type-fields.dto';

export class OrderPaymentTypesDto {
  @ApiProperty({ example: '123' })
  @Expose()
  @IsInt()
  orderPaymentTypeId: number;

  @ApiProperty({ example: 'TARJETA' })
  @Expose()
  @IsString()
  paymentType: string;

  @ApiProperty({ example: 'Descripción del tipo de pago' })
  @Expose()
  @IsString()
  description: string;
  
  @ApiProperty({ example: 'true' })
  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Type(() => OrderPaymentTypeFieldsDto)
  fields: OrderPaymentTypeFieldsDto[];
}