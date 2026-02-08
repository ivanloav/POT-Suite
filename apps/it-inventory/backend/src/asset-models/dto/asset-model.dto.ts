import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetModelDto {
  @ApiProperty({ description: 'ID del tipo de activo', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @ApiProperty({ description: 'ID de la marca del activo', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  brandId: number;

  @ApiProperty({ description: 'Nombre del modelo', example: 'Modelo X' })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ description: 'Indica si el modelo está activo', example: true })
  @IsNotEmpty()
  isActive: boolean;
}

export class UpdateAssetModelDto {
  @ApiProperty({ description: 'ID del tipo de activo', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @ApiProperty({ description: 'ID de la marca del activo', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  brandId: number;

  @ApiProperty({ description: 'Nombre del modelo', example: 'Modelo X' })
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty({ description: 'Indica si el modelo está activo', example: true })
  @IsNotEmpty()
  isActive: boolean;
}