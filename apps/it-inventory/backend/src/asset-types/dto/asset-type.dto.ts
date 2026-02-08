import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetTypeDto {
  @ApiProperty({ example: 'PC portátil', description: 'Nombre del tipo de activo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 10, description: 'Orden de clasificación', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, description: 'Si el tipo es asignable a empleados', required: false })
  @IsOptional()
  @IsBoolean()
  isAssignable?: boolean;

  @ApiProperty({ example: true, description: 'Si el tipo soporta sistema operativo', required: false })
  @IsOptional()
  @IsBoolean()
  supportsOs?: boolean;

  @ApiProperty({ example: true, description: 'Si el tipo está activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetTypeDto {
  @ApiProperty({ example: 'PC portátil', description: 'Nombre del tipo de activo', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 10, description: 'Orden de clasificación', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, description: 'Si el tipo es asignable a empleados', required: false })
  @IsOptional()
  @IsBoolean()
  isAssignable?: boolean;

  @ApiProperty({ example: true, description: 'Si el tipo soporta sistema operativo', required: false })
  @IsOptional()
  @IsBoolean()
  supportsOs?: boolean;

  @ApiProperty({ example: true, description: 'Si el tipo está activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
