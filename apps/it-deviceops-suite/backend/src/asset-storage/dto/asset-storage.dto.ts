import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetStorageDto {
  @ApiProperty({ description: 'Capacidad en GB', example: 256 })
  @IsNotEmpty()
  @IsNumber()
  capacityGb: number;

  @ApiProperty({ description: 'ID del tipo de disco', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  driveTypeId: number;

  @ApiProperty({ description: 'ID de la interfaz', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  interfaceId?: number;

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

export class UpdateAssetStorageDto {
  @ApiProperty({ description: 'Capacidad en GB', example: 256, required: false })
  @IsOptional()
  @IsNumber()
  capacityGb?: number;

  @ApiProperty({ description: 'ID del tipo de disco', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  driveTypeId?: number;

  @ApiProperty({ description: 'ID de la interfaz', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  interfaceId?: number;

  @ApiProperty({ description: 'ID del form factor', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  formFactorId?: number;

  @ApiProperty({ description: 'Notas adicionales', example: 'Alta velocidad', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Indica si la opción está activa', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
