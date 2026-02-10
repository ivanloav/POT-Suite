import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Código del rol' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Nombre del rol' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descripción del rol', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Estado del rol', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'IDs de permisos asignados', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'Código del rol', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Nombre del rol', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Descripción del rol', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Estado del rol', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'IDs de permisos asignados', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  permissionIds?: number[];
}
