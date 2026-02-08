import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class OrderCustomersDto {
  @ApiProperty({ example: 123 })
  @Expose()
  @IsInt()
  customerId: number;

  // Si customer_code es BIGINT en DB, mejor string
  @ApiProperty({ example: '123456789012' })
  @Expose()
  @IsString()
  @Transform(({ value }) => value.toString())
  customerCode: string;

  @ApiPropertyOptional({ example: 'MR' })
  @Expose()
  @IsString()
  shippingGender?: string | null;
  
  @ApiProperty({ example: 'María' })
  @Expose()
  @IsString()
  customerFirstName: string;

  @ApiProperty({ example: 'López' })
  @Expose()
  @IsString()
  customerLastName: string;

  @ApiPropertyOptional({ example: 'Calle Mayor, 10' })
  @Expose()
  @IsString()
  shippingAddressLine1?: string | null;

  @ApiPropertyOptional({ example: 'Piso 3ºB' })
  @Expose()
  @IsString()
  shippingAddressLine2?: string | null;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  shippingAddressLine3?: string | null;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  shippingAddressLine4?: string | null;

  @ApiPropertyOptional({ example: '28013' })
  @Expose()
  @IsString()
  shippingAddressCp?: string | null;

  @ApiPropertyOptional({ example: 'Madrid' })
  @Expose()
  @IsString()
  shippingAddressCity?: string | null;

  @ApiPropertyOptional({ example: 'ES' })
  @Expose()
  @IsString()
  shippingAddressCountry?: string | null;

  @ApiPropertyOptional({ example: 'ES' })
  @Expose()
  @IsString()
  shippingAddressCountryIso?: string | null;

  @ApiPropertyOptional({ example: 'Calle Facturación, 20' })
  @Expose()
  @IsString()
  billingAddressLine1?: string | null;

  @ApiPropertyOptional({ example: 'Portal B' })
  @Expose()
  @IsString()
  billingAddressLine2?: string | null;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  billingAddressLine3?: string | null;

  @ApiPropertyOptional()
  @Expose()
  @IsString()
  billingAddressLine4?: string | null;

  @ApiPropertyOptional({ example: '28015' })
  @Expose()
  @IsString()
  billingAddressCp?: string | null;

  @ApiPropertyOptional({ example: 'Madrid' })
  @Expose()
  @IsString()
  billingAddressCity?: string | null;

  @ApiPropertyOptional({ example: 'ES' })
  @Expose()
  @IsString()
  billingAddressCountry?: string | null;

  @ApiPropertyOptional({ example: '915123456' })
  @Expose()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional({ example: '600123456' })
  @Expose()
  @IsString()
  shippingMobilePhone?: string | null;

  @ApiPropertyOptional({ example: 'maria.lopez@ejemplo.com' })
  @Expose()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional({ example: 'Cliente VIP' })
  @Expose()
  @IsString()
  markedName?: string | null;

  @ApiPropertyOptional({ example: 'SI' })
  @Expose()
  @IsString()
  privileged?: string | null;
}