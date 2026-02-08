import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class CreateAssetMaintenancePlanDto {
  @ApiProperty({ example: 1, description: 'ID del site' })
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @ApiProperty({ example: 10, description: 'ID del asset' })
  @IsNotEmpty()
  @IsNumber()
  assetId: number;

  @ApiProperty({ example: 'Limpieza general', description: 'Título del mantenimiento' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'printer_cleaning', description: 'Tipo de mantenimiento', required: false })
  @IsOptional()
  @IsString()
  maintenanceType?: string;

  @ApiProperty({ example: 'media', description: 'Prioridad del mantenimiento', required: false, enum: ['baja', 'media', 'alta', 'critica'] })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ example: 'Limpieza de cabezal y platen roller', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ example: 30, description: 'Frecuencia en días', required: false })
  @ValidateIf((obj) => obj.isRecurring !== false)
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  frequencyDays?: number;

  @ApiProperty({ example: '2026-02-10', description: 'Próxima fecha de mantenimiento' })
  @IsNotEmpty()
  @IsDateString()
  nextDueDate: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetMaintenancePlanDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  siteId?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  assetId?: number;

  @ApiProperty({ example: 'Limpieza general', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'printer_cleaning', required: false })
  @IsOptional()
  @IsString()
  maintenanceType?: string;

  @ApiProperty({ example: 'media', required: false, enum: ['baja', 'media', 'alta', 'critica'] })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ example: 'Limpieza de cabezal y platen roller', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({ example: 30, required: false })
  @ValidateIf((obj) => obj.frequencyDays !== undefined && obj.isRecurring !== false)
  @IsNumber()
  @Min(1)
  frequencyDays?: number;

  @ApiProperty({ example: '2026-02-10', required: false })
  @IsOptional()
  @IsDateString()
  nextDueDate?: string;

  @ApiProperty({ example: '2026-02-05T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  lastDoneAt?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CompleteAssetMaintenanceDto {
  @ApiProperty({ example: '2026-02-05T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  performedAt?: string;

  @ApiProperty({ example: 'completed', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'Todo OK', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'Se detectó desgaste en el roller', required: false })
  @IsOptional()
  @IsString()
  incidents?: string;
}
