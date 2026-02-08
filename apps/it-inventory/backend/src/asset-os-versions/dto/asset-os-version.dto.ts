import { IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOsVersionDto {
  @ApiProperty({ description: 'ID de la familia de SO' })
  @IsNotEmpty()
  @IsNumber()
  osFamilyId: number;

  @ApiProperty({ description: 'Nombre de la versión del SO' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Si está activo' })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateOsVersionDto {
  @ApiProperty({ description: 'ID de la familia de SO', required: false })
  @IsOptional()
  @IsNumber()
  osFamilyId?: number;

  @ApiProperty({ description: 'Nombre de la versión del SO', required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Si está activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
