import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatalogAssetBrandDto {
  @ApiProperty({ description: 'Nombre de la marca', example: 'Lenovo' })
  @IsNotEmpty()
  @IsString()
  name: string;
}

