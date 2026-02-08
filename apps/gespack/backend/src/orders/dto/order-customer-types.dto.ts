import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class OrderCustomerTypesDto {
  @ApiProperty({ example: '123' })
  @Expose()
  @IsInt()
  customerTypeId: number;

  @ApiProperty({ example: '123' })
  @Expose()
  @IsString()
  typeCode: string;

  @ApiProperty({ example: 'Example' })
  @Expose()
  @IsString()
  typeName: string;
}