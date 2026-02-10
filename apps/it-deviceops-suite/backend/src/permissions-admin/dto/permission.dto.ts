import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Código del permiso' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Nombre del permiso' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descripción del permiso', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Estado del permiso', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePermissionDto {
  @ApiProperty({ description: 'Código del permiso', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Nombre del permiso', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Descripción del permiso', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Estado del permiso', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
