import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStorageFormFactorDto {
  @ApiProperty({ example: '2.5', description: 'Código del form factor de almacenamiento' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '2.5" (63.5mm)', description: 'Nombre del form factor' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStorageFormFactorDto {
  @ApiProperty({ example: '2.5', description: 'Código del form factor de almacenamiento' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: '2.5" (63.5mm)', description: 'Nombre del form factor' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
