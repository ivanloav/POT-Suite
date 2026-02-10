import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStorageDriveTypeDto {
  @ApiProperty({ example: 'SSD', description: 'Código del tipo de disco' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Solid State Drive', description: 'Nombre del tipo de disco' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateStorageDriveTypeDto {
  @ApiProperty({ example: 'SSD', description: 'Código del tipo de disco' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'Solid State Drive', description: 'Nombre del tipo de disco' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
