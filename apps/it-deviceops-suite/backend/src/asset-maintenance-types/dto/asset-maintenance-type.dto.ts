import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetMaintenanceTypeDto {
  @ApiProperty({ example: 'printer_cleaning', description: 'Codigo unico del tipo de mantenimiento' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: 'Limpieza impresora', description: 'Nombre del tipo de mantenimiento' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Limpieza general y cabezales', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10, description: 'Orden de clasificacion', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, description: 'Si el tipo esta activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetMaintenanceTypeDto {
  @ApiProperty({ example: 'printer_cleaning', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'Limpieza impresora', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Limpieza general y cabezales', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
