import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class OrderProductsListDto {
  @ApiProperty({ example: '123' })
  @Expose()
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Example reference' })
  @Expose()
  @IsString()
  productRef: string;

  @ApiProperty({ example: 'Example description' })
  @Expose()
  @IsString()
  description: string;

  @ApiProperty({ example: 19.99, type: Number })
  @Expose()
  @Transform(({ value }) => (value == null ? null : Number(value))) // <-- clave
  @IsNumber()
  price: number;

  @ApiProperty({ example: 2.5, type: Number, required: false })
  @Expose()
  @Transform(({ value }) => (value == null ? null : Number(value)))
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: 2, type: Number, required: false })
  @Expose()
  @Transform(({ value }) => (value == null ? null : Number(value)))
  @IsNumber()
  vatType?: number;

  @ApiProperty({ example: 2, type: Number, required: false })
  @Expose()
  @Transform(({ value }) => (value == null ? null : Number(value)))
  @IsNumber()
  vatValue?: number;
}