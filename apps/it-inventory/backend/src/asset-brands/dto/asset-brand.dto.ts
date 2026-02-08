import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetBrandDto {
  @ApiProperty({ example: 'Apple', description: 'Nombre de la marca' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: true, description: 'Si la marca está activa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetBrandDto {
  @ApiProperty({ example: 'Apple', description: 'Nombre de la marca', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: true, description: 'Si la marca está activa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
