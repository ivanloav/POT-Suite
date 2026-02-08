import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ description: 'ID del sitio', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  siteId: number;

  @ApiProperty({ description: 'ID del activo a asignar', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  assetId: number;

  @ApiProperty({ description: 'ID del empleado al que se asigna', example: 5 })
  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @ApiPropertyOptional({ description: 'Fecha de asignación', format: 'date', example: '2024-12-23' })
  @IsOptional()
  @IsDateString()
  assignedAt?: string;

  @ApiPropertyOptional({ description: 'Comentarios sobre la asignación', example: 'Reemplazo temporal' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReturnAssignmentDto {
  @ApiPropertyOptional({ description: 'Fecha de devolución', format: 'date-time', example: '2024-12-23T14:30:00Z' })
  @IsOptional()
  @IsDateString()
  returnedAt?: string;

  @ApiPropertyOptional({ description: 'Comentarios sobre la devolución', example: 'Equipo en buen estado' })
  @IsOptional()
  @IsString()
  comment?: string;
}
