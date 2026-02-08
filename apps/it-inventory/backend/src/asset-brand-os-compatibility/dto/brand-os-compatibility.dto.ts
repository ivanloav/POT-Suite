import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandOsCompatibilityDto {
  @ApiProperty({ description: 'ID de la marca' })
  @IsNotEmpty({ message: 'El ID de la marca es obligatorio' })
  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brandId: number;

  @ApiProperty({ description: 'ID de la familia de SO' })
  @IsNotEmpty({ message: 'El ID de la familia de SO es obligatorio' })
  @IsNumber({}, { message: 'El ID de la familia de SO debe ser un número' })
  osFamilyId: number;
}

export class DeleteBrandOsCompatibilityDto {
  @ApiProperty({ description: 'ID de la marca' })
  @IsNotEmpty({ message: 'El ID de la marca es obligatorio' })
  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brandId: number;

  @ApiProperty({ description: 'ID de la familia de SO' })
  @IsNotEmpty({ message: 'El ID de la familia de SO es obligatorio' })
  @IsNumber({}, { message: 'El ID de la familia de SO debe ser un número' })
  osFamilyId: number;
}
