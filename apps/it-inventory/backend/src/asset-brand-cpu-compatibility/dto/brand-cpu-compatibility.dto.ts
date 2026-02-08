import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandCpuCompatibilityDto {
  @ApiProperty({ description: 'ID de la marca' })
  @IsNotEmpty({ message: 'El ID de la marca es obligatorio' })
  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brandId: number;

  @ApiProperty({ description: 'ID del vendor de CPU' })
  @IsNotEmpty({ message: 'El ID del vendor de CPU es obligatorio' })
  @IsNumber({}, { message: 'El ID del vendor de CPU debe ser un número' })
  cpuVendorId: number;
}

export class DeleteBrandCpuCompatibilityDto {
  @ApiProperty({ description: 'ID de la marca' })
  @IsNotEmpty({ message: 'El ID de la marca es obligatorio' })
  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brandId: number;

  @ApiProperty({ description: 'ID del vendor de CPU' })
  @IsNotEmpty({ message: 'El ID del vendor de CPU es obligatorio' })
  @IsNumber({}, { message: 'El ID del vendor de CPU debe ser un número' })
  cpuVendorId: number;
}
