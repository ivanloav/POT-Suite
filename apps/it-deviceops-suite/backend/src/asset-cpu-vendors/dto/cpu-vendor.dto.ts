import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCpuVendorDto {
  @ApiProperty({ example: 'INTEL', description: 'Código único del vendedor' })
  @IsNotEmpty({ message: 'El código es requerido' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Intel Corporation', description: 'Nombre del vendedor' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCpuVendorDto {
  @ApiProperty({ example: 'INTEL', description: 'Código único del vendedor' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'Intel Corporation', description: 'Nombre del vendedor' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
