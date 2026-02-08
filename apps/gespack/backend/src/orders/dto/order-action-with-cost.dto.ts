import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsString, IsNumber, IsOptional } from 'class-validator';

export class OrderActionWithCostDto {
  @ApiProperty({ example: 1, description: 'ID de la acción' })
  @Expose()
  @IsInt()
  actionId: number;

  @ApiProperty({ example: 'Entrega', description: 'Nombre de la acción' })
  @Expose()
  @IsString()
  actionName: string;

  @ApiProperty({ example: 12.34, description: 'Coste de envío asociado a la categoría de la acción (puede ser null si no aplica)' })
  @Expose()
  @IsOptional()
  @IsNumber()
  mandatoryFee: number | null;
}