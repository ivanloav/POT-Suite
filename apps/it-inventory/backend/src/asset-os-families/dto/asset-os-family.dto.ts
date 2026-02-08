import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOsFamilyDto {
  @ApiProperty({ description: 'Nombre de la familia de SO' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Si está activa' })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateOsFamilyDto {
  @ApiProperty({ description: 'Nombre de la familia de SO', required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Si está activa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
