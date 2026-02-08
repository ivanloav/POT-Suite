import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateOrderNoteDto {
  @ApiProperty({ example: 'Nota para el pedido' })
  @IsNotEmpty()
  @IsString()
  noteText: string;

  @ApiProperty({ example: false, description: 'Si es true, la nota es interna (no visible para el cliente)' })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}

export class OrderNoteDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  noteId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  siteId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  orderId: number;

  @ApiProperty({ example: '00000123' })
  @IsString()
  orderReference: string;

  @ApiProperty({ example: 'Nota para el pedido' })
  @IsString()
  noteText: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isInternal: boolean;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  createdBy: string;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  updatedAt: Date;
}
