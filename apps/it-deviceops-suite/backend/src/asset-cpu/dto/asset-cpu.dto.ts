import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetCpuDto {
  @ApiProperty({ description: 'ID del fabricante', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  vendorId: number;

  @ApiProperty({ description: 'Modelo de la CPU', example: 'M4 Max' })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ description: 'ID del segmento de la CPU', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  segmentId?: number;

  @ApiProperty({ description: 'Número de núcleos de la CPU', example: 8, required: false })
  @IsOptional()
  @IsNumber()
  cores?: number;

  @ApiProperty({ description: 'Número de hilos de la CPU', example: 16, required: false })
  @IsOptional()
  @IsNumber()
  threads?: number;

  @ApiProperty({ description: 'Frecuencia base de la CPU en GHz', example: 3.2, required: false })
  @IsOptional()
  @IsNumber()
  baseGhz?: number;

  @ApiProperty({ description: 'Frecuencia boost de la CPU en GHz', example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  boostGhz?: number;

  @ApiProperty({ description: 'Notas adicionales sobre la CPU', example: 'Modelo de alta gama para estaciones de trabajo', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Indica si el modelo está activo', example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}

export class UpdateAssetCpuDto {
  @ApiProperty({ description: 'ID del fabricante', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  vendorId?: number;

  @ApiProperty({ description: 'Modelo de la CPU', example: 'M4 Max', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ description: 'ID del segmento', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  segmentId?: number;

  @ApiProperty({ description: 'Número de núcleos', example: 8, required: false })
  @IsOptional()
  @IsNumber()
  cores?: number;

  @ApiProperty({ description: 'Número de hilos', example: 16, required: false })
  @IsOptional()
  @IsNumber()
  threads?: number;

  @ApiProperty({ description: 'Frecuencia base en GHz', example: 3.2, required: false })
  @IsOptional()
  @IsNumber()
  baseGhz?: number;

  @ApiProperty({ description: 'Frecuencia boost en GHz', example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  boostGhz?: number;

  @ApiProperty({ description: 'Notas', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Indica si el modelo está activo', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}