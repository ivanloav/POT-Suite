import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsString, IsBoolean } from 'class-validator';

export class OrderPriorityTypesDto {
  @ApiProperty({ example: '123' })
  @Expose()
  @IsInt()
  actionPriorityId: number;

  @ApiProperty({ example: '123' })
  @Expose()
  @IsString()
  priorityName: string;

  @ApiProperty({ example: 'Descripción del tipo de prioridad' })
  @Expose()
  @IsString()
  description: string;
  
  @ApiProperty({ example: 'true' })
  @Expose()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: 12.34, description: 'Coste de envío asociado a la categoría de la acción (puede ser null si no aplica)' })
  @Expose()
  @IsInt()
  shippingCost: number | null;
}