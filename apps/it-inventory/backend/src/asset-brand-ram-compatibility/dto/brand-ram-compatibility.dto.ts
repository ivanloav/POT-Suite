import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandRamCompatibilityDto {
  @ApiProperty({ description: 'ID de la marca' })
  @IsNotEmpty({ message: 'El ID de la marca es obligatorio' })
  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brandId: number;

  @ApiProperty({ description: 'ID del tipo de memoria RAM' })
  @IsNotEmpty({ message: 'El ID del tipo de memoria es obligatorio' })
  @IsNumber({}, { message: 'El ID del tipo de memoria debe ser un número' })
  ramTypeId: number;
}

export class DeleteBrandRamCompatibilityDto {
  @ApiProperty({ description: 'ID de la marca' })
  @IsNotEmpty({ message: 'El ID de la marca es obligatorio' })
  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brandId: number;

  @ApiProperty({ description: 'ID del tipo de memoria RAM' })
  @IsNotEmpty({ message: 'El ID del tipo de memoria es obligatorio' })
  @IsNumber({}, { message: 'El ID del tipo de memoria debe ser un número' })
  ramTypeId: number;
}
