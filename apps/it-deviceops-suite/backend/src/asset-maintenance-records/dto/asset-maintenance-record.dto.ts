import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAssetMaintenanceRecordDto {
  @ApiProperty({ example: 1, description: 'ID del plan' })
  @IsNotEmpty()
  @IsNumber()
  planId: number;

  @ApiProperty({ example: 1, description: 'ID del site' })
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @ApiProperty({ example: 10, description: 'ID del asset' })
  @IsNotEmpty()
  @IsNumber()
  assetId: number;

  @ApiProperty({ example: '2026-02-05T12:00:00Z', description: 'Fecha de ejecución' })
  @IsNotEmpty()
  @IsDateString()
  performedAt: string;

  @ApiProperty({ example: '2026-02-09', required: false, description: 'Fecha planificada' })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiProperty({ example: 'completed', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'OK', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'Incidencia', required: false })
  @IsOptional()
  @IsString()
  incidents?: string;
}
