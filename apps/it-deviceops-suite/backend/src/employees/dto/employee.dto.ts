import { IsNotEmpty, IsString, IsOptional, IsEmail, IsNumber, IsBoolean, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'ID de la sede', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @ApiProperty({ description: 'Nombre', example: 'Juan' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Primer apellido', example: 'Pérez' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Segundo apellido', example: 'García' })
  @IsOptional()
  @IsString()
  secondLastName?: string;

  @ApiPropertyOptional({ description: 'Email corporativo', example: 'juan.perez@empresa.com' })
  @IsOptional()
  @ValidateIf(o => o.email !== '' && o.email !== null)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto', example: '600123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Notas adicionales', example: 'Departamento de IT' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ description: 'ID de la sede', example: 1 })
  @IsOptional()
  @IsNumber()
  siteId?: number;

  @ApiPropertyOptional({ description: 'Nombre', example: 'Juan' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Primer apellido', example: 'Pérez' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Segundo apellido', example: 'García' })
  @IsOptional()
  @IsString()
  secondLastName?: string;

  @ApiPropertyOptional({ description: 'Email corporativo', example: 'juan.perez@empresa.com' })
  @IsOptional()
  @ValidateIf(o => o.email !== '' && o.email !== null)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto', example: '600123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Estado del empleado', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Notas adicionales', example: 'Departamento de IT' })
  @IsOptional()
  @IsString()
  notes?: string;
}
