import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  lineNumber?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  productId?: number;

  @ApiProperty({ example: 'PROD-A1' })
  @IsString()
  @IsOptional()
  productRef?: string;

  @ApiProperty({ example: 'REF-001' })
  @IsString()
  @IsOptional()
  catalogRef?: string;

  @ApiProperty({ example: 'CAT-001' })
  @IsString()
  @IsOptional()
  catalogCode?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsOptional()
  qty?: number;

  @ApiProperty({ example: 'Producto ejemplo' })
  @IsString()
  @IsOptional()
  productDescription?: string;

  @ApiProperty({ example: 25.50 })
  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @ApiProperty({ example: 51.00 })
  @IsNumber()
  @IsOptional()
  lineTotal?: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isStockReserved?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isSubstitute?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isUnavailable?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsOptional()
  isSupplierShipped?: boolean;
}
