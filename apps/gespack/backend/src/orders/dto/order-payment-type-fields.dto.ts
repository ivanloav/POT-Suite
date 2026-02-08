import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsString, IsBoolean } from 'class-validator';

export class OrderPaymentTypeFieldsDto {
  @ApiProperty({ example: '123' })
  @Expose()
  @IsInt()
  fieldId: number;

  @ApiProperty({ example: '123' })
  @Expose()
  @IsInt()
  orderPaymentTypeId: number;

  @ApiProperty({ example: 'Name' })
  @Expose()
  @IsString()
  fieldName: string;

  @ApiProperty({ example: 'Type field' })
  @Expose()
  @IsString()
  fieldType: string;
  
  @ApiProperty({ example: 'true' })
  @Expose()
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ example: '0' })
  @Expose()
  @IsInt()
  fieldOrder: number;
}