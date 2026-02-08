import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../entities/orders.entity';
import { CreateOrderItemDto } from './create-order-item.dto';
import { CreateOrderPaymentDto } from './create-order-payment.dto';
import { CreateOrderAddressDto } from './order-address.dto';
import { CreateOrderNoteDto } from './order-note.dto';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  siteId: number;

  @ApiProperty({ example: 'NAMESITE'})
  @IsOptional()
  @IsString()
  siteName: string;

  @ApiProperty({ example: '2025-08-14T10:00:00Z', required: false })
  @IsOptional()
  @IsDate()
  orderDatetime?: Date;

  @ApiProperty({ example: 'REF-12345', required: false })
  @IsOptional()
  @IsString()
  orderReference?: string; // Opcional: se genera automáticamente si no se proporciona

  @ApiProperty({ example: 1 })
  @IsNumber()
  brandId: number;

  @ApiProperty({ example: 13, required: false })
  @IsOptional()
  @IsNumber()
  orderSourceId?: number;

  @ApiProperty({ example: 'web', required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  actionId?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  actionCategoryId: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  actionPriorityId?: number;

  @ApiProperty({ example: '4.99', required: false })
  @IsOptional()
  @IsString()
  shippingCost?: string;

  @ApiProperty({ example: '1.50', required: false })
  @IsOptional()
  @IsString()
  mandatoryShippingFee?: string;

  @ApiProperty({ example: 123, required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ example: 'M', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ 
    description: 'Payment data to create in order_payments table',
    type: 'object'
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateOrderPaymentDto)
  payment: CreateOrderPaymentDto;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiProperty({ example: '2025-08-15', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paidAt?: Date;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isInvoiced?: boolean;

  @ApiProperty({ example: '2025-08-15', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  invoicedAt?: Date;

  @ApiProperty({ example: 3, default: 0 })
  @IsOptional()
  @IsNumber()
  orderLines?: number;

  @ApiProperty({ example: 12.5, default: 0 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: '1', required: false })
  @IsOptional()
  @IsString()
  clientType?: string;

  @ApiProperty({ example: 'John Smith', required: false })
  @IsOptional()
  @IsString()
  participant?: string;

  @ApiProperty({ example: 199.99, required: false })
  @IsOptional()
  @IsNumber()
  orderAmount?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  bi1?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  bi2?: number;

  @ApiProperty({ example: 21, required: false })
  @IsOptional()
  @IsNumber()
  tva1?: number;

  @ApiProperty({ example: 10.5, required: false })
  @IsOptional()
  @IsNumber()
  tva2?: number;

  @ApiProperty({ example: 'Returned', required: false })
  @IsOptional()
  @IsString()
  returnStatus?: string;

  @ApiProperty({ example: 'Express', required: false })
  @IsOptional()
  @IsString()
  shippingType?: string;

  @ApiProperty({ example: '500', required: false })
  @IsOptional()
  @IsString()
  valueEm?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isCallcenter?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isStockReserved?: boolean;

  @ApiProperty({ example: 'A', required: false })
  @IsOptional()
  @IsString()
  lastLetter?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isUpselling?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isUpsellingPurchase?: boolean;

  @ApiProperty({ example: '15', required: false })
  @IsOptional()
  @IsString()
  upsellingAmount?: string;

  @ApiProperty({ example: 'Offer2025', required: false })
  @IsOptional()
  @IsString()
  upsellingOffer?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isDeferred?: boolean;

  @ApiProperty({ example: 'Truck', required: false })
  @IsOptional()
  @IsString()
  transport?: string;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrivileged?: boolean;

  @ApiProperty({ example: '10', required: false })
  @IsOptional()
  @IsNumber()
  clubCardFee?: number;

  @ApiProperty({ example: '5', required: false })
  @IsOptional()
  @IsNumber()
  clubCardDiscount?: number;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isShippedBySupplier?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isPartiallyShippedBySupplier?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isSupplier?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isSubstitute?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isNoArticle?: boolean;

  @ApiProperty({ example: '0', required: false })
  @IsOptional()
  @IsString()
  noArticleAmount?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isBav?: boolean;

  @ApiProperty({ example: '0', required: false })
  @IsOptional()
  @IsNumber()
  bavAmount?: number;

  @ApiProperty({ example: 'BAV123', required: false })
  @IsOptional()
  @IsString()
  bavOrder?: string;

  @ApiProperty({ example: '50', required: false })
  @IsOptional()
  @IsNumber()
  amountDue?: number;

  @ApiProperty({ example: 'NA-001', required: false })
  @IsOptional()
  @IsString()
  nextAvailableNumber?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isGeneratedBav?: boolean;

  @ApiProperty({ example: '10', required: false })
  @IsOptional()
  @IsString()
  generatedBavAmount?: string;

  @ApiProperty({ enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnnulled?: boolean;

  @ApiProperty({ example: '2025-08-15', required: false })
  @IsOptional()
  @IsDate()
  annulledDate?: Date;

  @ApiProperty({ example: 'admin', required: false })
  @IsOptional()
  @IsString()
  annulledBy?: string;

  @ApiProperty({ example: 'HojaDePedido'})
  @IsOptional()
  @IsString()
  section: string;

  @ApiProperty({ example: 1, required: true, description: 'ID del usuario creador' })
  @IsNotEmpty()
  @IsNumber()
  createdBy!: number;

  @ApiProperty({ example: '2025-08-14T12:00:00Z', required: false })
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiProperty({ example: 'system', required: false })
  @IsOptional()
  @IsString()
  modifiedBy?: string;

  @ApiProperty({ example: '2025-08-14T12:00:00Z', required: false })
  @IsOptional()
  @IsDate()
  modifiedAt?: Date;

  @ApiProperty({ 
    type: [CreateOrderItemDto],
    description: 'Array de líneas de pedido',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems?: CreateOrderItemDto[];

  @ApiProperty({ 
    type: CreateOrderAddressDto,
    description: 'Direcciones de facturación y envío del pedido',
    required: false 
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  addresses?: CreateOrderAddressDto;

  @ApiProperty({ 
    type: [CreateOrderNoteDto],
    description: 'Array de observaciones/notas del pedido (internas y/o externas)',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderNoteDto)
  notes?: CreateOrderNoteDto[];
}
