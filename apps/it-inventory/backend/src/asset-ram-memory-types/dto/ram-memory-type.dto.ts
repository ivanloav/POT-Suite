import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRamMemoryTypeDto {
  @ApiProperty({ example: 'DDR4', description: 'Código del tipo de memoria RAM' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'DDR4 SDRAM', description: 'Nombre del tipo de memoria RAM' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRamMemoryTypeDto {
  @ApiProperty({ example: 'DDR4', description: 'Código del tipo de memoria RAM' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'DDR4 SDRAM', description: 'Nombre del tipo de memoria RAM' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
