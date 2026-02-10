import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRamFormFactorDto {
  @ApiProperty({ example: 'DIMM', description: 'Código del form factor de RAM' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'DIMM (Dual In-line Memory Module)', description: 'Nombre del form factor' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRamFormFactorDto {
  @ApiProperty({ example: 'DIMM', description: 'Código del form factor de RAM' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'DIMM (Dual In-line Memory Module)', description: 'Nombre del form factor' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
