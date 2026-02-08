// backend/src/users/dto/create-user.dto.ts - ACTUALIZAR
import { IsString, IsEmail, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  name: string; // 👈 Frontend envía 'name', mapear a 'userName'

  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  password: string; // 👈 Frontend envía 'password', mapear a 'userPassword'

  @ApiProperty({ description: 'Idioma del usuario' })
  @IsString()
  @IsOptional()
  locale: string; // 👈 NUEVO: No existe en la entidad, añadir a User entity

  @ApiProperty({ description: 'Es cliente' })
  @IsBoolean()
  @IsOptional()
  isCustomer?: boolean;

  @ApiProperty({ description: 'Es administrador' })
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ApiProperty({ description: 'Está activo' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Es CB' })
  @IsBoolean()
  @IsOptional()
  isCB?: boolean;

  @ApiProperty({ description: 'Es List' })
  @IsBoolean()
  @IsOptional()
  isList?: boolean;

  @ApiProperty({ description: 'Recibe reporte diario' })
  @IsBoolean()
  @IsOptional()
  isDailyOrdersReport?: boolean;

  @ApiProperty({ description: 'IDs de sites seleccionados', required: false, type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @IsOptional()
  selectedSites?: number[];
}