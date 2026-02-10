import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty({ example: '2026-01-06', description: 'Fecha del festivo' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Reyes Magos', description: 'Nombre del festivo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Festivo nacional', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHolidayDto {
  @ApiProperty({ example: '2026-01-06', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Reyes Magos', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Festivo nacional', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
