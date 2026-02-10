import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetStatusDto {
  @ApiProperty({ example: 'in_stock', description: 'Código único del estado' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'En Stock', description: 'Nombre del estado' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', description: 'Clases CSS de Tailwind para el badge', required: false })
  @IsOptional()
  @IsString()
  colorClass?: string;

  @ApiProperty({ example: 10, description: 'Orden de clasificación', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, description: 'Si el estado está activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetStatusDto {
  @ApiProperty({ example: 'in_stock', description: 'Código único del estado', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'En Stock', description: 'Nombre del estado', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', description: 'Clases CSS de Tailwind para el badge', required: false })
  @IsOptional()
  @IsString()
  colorClass?: string;

  @ApiProperty({ example: 10, description: 'Orden de clasificación', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, description: 'Si el estado está activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
