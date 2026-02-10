import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTypeOsCompatibilityDto {
  @ApiProperty({ description: 'ID del tipo de activo' })
  @IsNotEmpty({ message: 'El ID del tipo de activo es obligatorio' })
  @IsNumber({}, { message: 'El ID del tipo de activo debe ser un número' })
  typeId: number;

  @ApiProperty({ description: 'ID de la familia de SO' })
  @IsNotEmpty({ message: 'El ID de la familia de SO es obligatorio' })
  @IsNumber({}, { message: 'El ID de la familia de SO debe ser un número' })
  osFamilyId: number;
}

export class DeleteTypeOsCompatibilityDto {
  @ApiProperty({ description: 'ID del tipo de activo' })
  @IsNotEmpty({ message: 'El ID del tipo de activo es obligatorio' })
  @IsNumber({}, { message: 'El ID del tipo de activo debe ser un número' })
  typeId: number;

  @ApiProperty({ description: 'ID de la familia de SO' })
  @IsNotEmpty({ message: 'El ID de la familia de SO es obligatorio' })
  @IsNumber({}, { message: 'El ID de la familia de SO debe ser un número' })
  osFamilyId: number;
}
