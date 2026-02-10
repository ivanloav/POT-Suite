import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStorageInterfaceDto {
  @ApiProperty({ example: 'SATA', description: 'Código de la interfaz de almacenamiento' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'SATA III (6 Gb/s)', description: 'Nombre de la interfaz' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStorageInterfaceDto {
  @ApiProperty({ example: 'SATA', description: 'Código de la interfaz de almacenamiento' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'SATA III (6 Gb/s)', description: 'Nombre de la interfaz' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
