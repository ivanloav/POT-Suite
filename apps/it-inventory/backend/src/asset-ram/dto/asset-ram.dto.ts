import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetRamDto {
  @ApiProperty({ description: 'Capacidad en GB', example: 16 })
  @IsNotEmpty()
  @IsNumber()
  capacityGb: number;

  @ApiProperty({ description: 'ID del tipo de memoria', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  memTypeId: number;

  @ApiProperty({ description: 'Velocidad en MT/s', example: 3200, required: false })
  @IsOptional()
  @IsNumber()
  speedMts?: number;

  @ApiProperty({ description: 'ID del form factor', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  formFactorId?: number;

  @ApiProperty({ description: 'Notas adicionales', example: 'Alta velocidad', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Indica si la opción está activa', example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}

export class UpdateAssetRamDto {
  @ApiProperty({ description: 'Capacidad en GB', example: 16, required: false })
  @IsOptional()
  @IsNumber()
  capacityGb?: number;

  @ApiProperty({ description: 'ID del tipo de memoria', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  memTypeId?: number;

  @ApiProperty({ description: 'Velocidad en MT/s', example: 3200, required: false })
  @IsOptional()
  @IsNumber()
  speedMts?: number;

  @ApiProperty({ description: 'ID del form factor', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  formFactorId?: number;

  @ApiProperty({ description: 'Notas', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Indica si la opción está activa', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}