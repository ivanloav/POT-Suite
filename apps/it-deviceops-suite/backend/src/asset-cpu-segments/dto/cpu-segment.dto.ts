import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCpuSegmentDto {
  @ApiProperty({ example: 'DESKTOP', description: 'Código del segmento de CPU' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Desktop', description: 'Nombre del segmento de CPU' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCpuSegmentDto {
  @ApiProperty({ example: 'DESKTOP', description: 'Código del segmento de CPU' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Desktop', description: 'Nombre del segmento de CPU' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
