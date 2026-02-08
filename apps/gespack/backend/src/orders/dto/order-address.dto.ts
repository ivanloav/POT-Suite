import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateOrderAddressDto {
  // Dirección de facturación
  @ApiPropertyOptional({ example: 'Sr. Juan Pérez' })
  @Expose()
  @IsString()
  @IsOptional()
  billingCustomerName?: string;

  @ApiPropertyOptional({ example: 'Calle Principal 123' })
  @Expose()
  @IsString()
  @IsOptional()
  billingAddressLine1?: string;

  @ApiPropertyOptional({ example: 'Piso 2, Puerta B' })
  @Expose()
  @IsString()
  @IsOptional()
  billingAddressLine2?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  billingAddressLine3?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  billingAddressLine4?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  billingAddressLine5?: string;

  @ApiPropertyOptional({ example: '28001' })
  @Expose()
  @IsString()
  @IsOptional()
  billingPostalCode?: string;

  @ApiPropertyOptional({ example: 'Madrid' })
  @Expose()
  @IsString()
  @IsOptional()
  billingCity?: string;

  @ApiPropertyOptional({ example: '+34600123456' })
  @Expose()
  @IsString()
  @IsOptional()
  billingMobilePhone?: string;

  // Dirección de envío
  @ApiPropertyOptional({ example: 'Sra. María López' })
  @Expose()
  @IsString()
  @IsOptional()
  shippingCustomerName?: string;

  @ApiPropertyOptional({ example: 'Avenida Libertad 456' })
  @Expose()
  @IsString()
  @IsOptional()
  shippingAddressLine1?: string;

  @ApiPropertyOptional({ example: 'Edificio A' })
  @Expose()
  @IsString()
  @IsOptional()
  shippingAddressLine2?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  shippingAddressLine3?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  shippingAddressLine4?: string;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  @IsOptional()
  shippingAddressLine5?: string;

  @ApiPropertyOptional({ example: '28002' })
  @Expose()
  @IsString()
  @IsOptional()
  shippingPostalCode?: string;

  @ApiPropertyOptional({ example: 'Barcelona' })
  @Expose()
  @IsString()
  @IsOptional()
  shippingCity?: string;

  @ApiPropertyOptional({ example: '+34600654321' })
  @Expose()
  @IsString()
  @IsOptional()
  shippingMobilePhone?: string;
}

export class OrderAddressDto extends CreateOrderAddressDto {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  addressId: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  orderId: number;

  @ApiProperty({ example: 1 })
  @Expose()
  @IsInt()
  siteId: number;

  @ApiProperty({ example: 'ORD-001' })
  @Expose()
  @IsString()
  orderReference: string;

  @ApiPropertyOptional({ example: 'admin' })
  @Expose()
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiProperty({ example: '2025-11-05T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({ example: 'admin' })
  @Expose()
  @IsString()
  @IsOptional()
  modifiedBy?: string;

  @ApiProperty({ example: '2025-11-05T10:00:00Z' })
  @Expose()
  updatedAt: Date;
}
