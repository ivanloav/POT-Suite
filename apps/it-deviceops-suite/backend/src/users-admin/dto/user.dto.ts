import { IsString, IsEmail, IsBoolean, IsOptional, MinLength, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Nombre de usuario' })
  @IsString()
  userName: string;

  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Idioma del usuario (ISO code)', default: 'es' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: 'Estado del usuario', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'IDs de sitios asignados', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  siteIds?: number[];

  @ApiProperty({ description: 'IDs de roles asignados', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  roleIds?: number[];
}

export class UpdateUserDto {
  @ApiProperty({ description: 'Nombre de usuario', required: false })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiProperty({ description: 'Email del usuario', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Nueva contraseña', required: false })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'Idioma del usuario (ISO code)', required: false })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ description: 'Estado del usuario', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'IDs de sitios asignados', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  siteIds?: number[];

  @ApiProperty({ description: 'IDs de roles asignados', type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  roleIds?: number[];
}
