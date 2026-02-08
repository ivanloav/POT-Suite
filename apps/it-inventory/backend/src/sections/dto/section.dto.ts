import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 1, description: 'ID del site' })
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @ApiProperty({ example: 'Contabilidad', description: 'Nombre de la sección' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 0, description: 'Orden de visualización', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, description: 'Si la sección está activa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSectionDto {
  @ApiProperty({ example: 1, description: 'ID del site', required: false })
  @IsOptional()
  @IsNumber()
  siteId?: number;

  @ApiProperty({ example: 'Contabilidad', description: 'Nombre de la sección', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 0, description: 'Orden de visualización', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ example: true, description: 'Si la sección está activa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
