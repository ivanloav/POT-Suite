import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'MAD', description: 'Código único del site' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Madrid Centro', description: 'Nombre del site' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSiteDto {
  @ApiProperty({ example: 'MAD', description: 'Código único del site', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Madrid Centro', description: 'Nombre del site', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
