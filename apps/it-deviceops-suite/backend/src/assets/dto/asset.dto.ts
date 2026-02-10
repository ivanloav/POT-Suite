import { IsNotEmpty, IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAssetDto:
 *       type: object
 *       required:
 *         - assetTag
 *         - typeId
 *       properties:
 *         assetTag:
 *           type: string
 *           description: Etiqueta única del activo
 *           example: PC-2024-001
 *         typeId:
 *           type: integer
 *           description: ID del tipo de activo
 *           example: 1
 */
export class CreateAssetDto {
  @ApiProperty({
    description: 'ID del site',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @ApiProperty({
    description: 'Etiqueta única del activo',
    example: 'PC-2024-001',
  })
  @IsNotEmpty()
  @IsString()
  assetTag: string;

  @ApiProperty({
    description: 'ID del tipo de activo',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  typeId: number;

  @ApiPropertyOptional({
    description: 'ID del empleado asignado',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({
    description: 'ID de la sección',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  sectionId?: number;

  @ApiPropertyOptional({
    description: 'ID del modelo',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  modelId?: number;

  @ApiPropertyOptional({
    description: 'ID de la versión del sistema operativo',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  osVersionId?: number;

  @ApiPropertyOptional({
    description: 'ID del CPU',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  cpuId?: number;

  @ApiPropertyOptional({
    description: 'ID de la opción de RAM',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  ramId?: number;

  @ApiPropertyOptional({
    description: 'ID de la opción de almacenamiento',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  storageId?: number;

  @ApiPropertyOptional({
    description: 'Número de serie',
    example: 'SN123456789',
  })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional({
    description: 'IMEI (para dispositivos móviles)',
    example: '123456789012345',
  })
  @IsOptional()
  @IsString()
  imei?: string;

  @ApiPropertyOptional({
    description: 'Dirección MAC',
    example: '00:1A:2B:3C:4D:5E',
  })
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional({
    description: 'Dirección IP',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'UUID del dispositivo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  uuid?: string;

  @ApiPropertyOptional({
    description: 'ID del estado del activo',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiPropertyOptional({
    description: 'Fecha de compra',
    format: 'date',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de garantía',
    format: 'date',
    example: '2027-01-15',
  })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiPropertyOptional({
    description: 'Ubicación física del activo',
    example: 'Oficina Principal - Piso 2',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Requiere mantenimiento preventivo',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateAssetDto:
 *       type: object
 *       properties:
 *         assetTag:
 *           type: string
 */
export class UpdateAssetDto {
  @ApiPropertyOptional({ description: 'Etiqueta única del activo', example: 'PC-2024-001' })
  @IsOptional()
  @IsString()
  assetTag?: string;

  @ApiPropertyOptional({ description: 'ID del tipo de activo', example: 1 })
  @IsOptional()
  @IsNumber()
  typeId?: number;

  @ApiPropertyOptional({ description: 'ID del empleado asignado', example: 1 })
  @IsOptional()
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({ description: 'ID de la sección', example: 1 })
  @IsOptional()
  @IsNumber()
  sectionId?: number;

  @ApiPropertyOptional({ description: 'ID del modelo', example: 1 })
  @IsOptional()
  @IsNumber()
  modelId?: number;

  @ApiPropertyOptional({ description: 'ID de la versión del sistema operativo', example: 1 })
  @IsOptional()
  @IsNumber()
  osVersionId?: number;

  @ApiPropertyOptional({ description: 'ID del CPU', example: 1 })
  @IsOptional()
  @IsNumber()
  cpuId?: number;

  @ApiPropertyOptional({ description: 'ID de la opción de RAM', example: 1 })
  @IsOptional()
  @IsNumber()
  ramId?: number;

  @ApiPropertyOptional({ description: 'ID de la opción de almacenamiento', example: 1 })
  @IsOptional()
  @IsNumber()
  storageId?: number;

  @ApiPropertyOptional({ description: 'Número de serie', example: 'SN123456789' })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional({ description: 'IMEI', example: '123456789012345' })
  @IsOptional()
  @IsString()
  imei?: string;

  @ApiPropertyOptional({ description: 'Dirección MAC', example: '00:1A:2B:3C:4D:5E' })
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional({ description: 'Dirección IP', example: '192.168.1.100' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsString()
  uuid?: string;

  @ApiPropertyOptional({ description: 'ID del estado del activo', example: 1 })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiPropertyOptional({ description: 'Fecha de compra', format: 'date', example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin de garantía', format: 'date', example: '2027-01-15' })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiPropertyOptional({ description: 'Ubicación física', example: 'Oficina Principal - Piso 2' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales', example: 'Requiere mantenimiento' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     RetireAssetDto:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 */
export class RetireAssetDto {
  @ApiPropertyOptional({
    description: 'Motivo del retiro del activo',
    example: 'Equipo obsoleto - Reemplazado por modelo más nuevo',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
