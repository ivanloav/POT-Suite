import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, IsIn } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class OrderBaseDto {
  // ───────────── Identificación / claves ─────────────
  @ApiProperty({ type: Number, example: 30, description: 'Site multi-tenant' })
  @IsNumber()
  siteId!: number;

  @ApiProperty({ type: String, example: 'WEB-2025-000123' })
  @IsString()
  orderReference!: string;

  // ───────────── Fechas principales ─────────────
  @ApiPropertyOptional({ type: String, format: 'date-time', example: '2025-08-10T12:34:56.000Z' })
  @IsOptional() @IsDateString()
  orderDatetime?: string | null;

  // ───────────── Relaciones por ID ─────────────
  @ApiProperty({ type: Number, example: 5 })
  @IsNumber()
  brandId!: number;

  @ApiPropertyOptional({ type: Number, example: 12 })
  @IsOptional() @IsNumber()
  actionId?: number | null;

  @ApiProperty({ type: Number, example: 3 })
  @IsNumber()
  actionCategoryId!: number;

  @ApiPropertyOptional({ type: Number, example: 2 })
  @IsOptional() @IsNumber()
  actionPriorityId?: number | null;

  @ApiPropertyOptional({ type: Number, example: 777 })
  @IsOptional() @IsNumber()
  customerId?: number | null;

  @ApiProperty({ type: Number, example: 1, description: 'Tipo de pago (FK)' })
  @IsNumber()
  paymentTypeId!: number;

  // ───────────── Datos del cliente / metadatos ─────────────
  @ApiPropertyOptional({ example: 'web' })
  @IsOptional() @IsString()
  source?: string | null;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional() @IsString()
  gender?: string | null;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional() @IsString()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional() @IsString()
  lastName?: string | null;

  // ───────────── Importes / numeric (como string para evitar precisión) ─────────────
  @ApiPropertyOptional({ type: String, example: '12.34' })
  @IsOptional() @IsString()
  shippingCost?: string | null;

  @ApiPropertyOptional({ type: String, example: '3.50' })
  @IsOptional() @IsString()
  mandatoryShippingFee?: string | null;

  @ApiPropertyOptional({ type: String, example: '120.99' })
  @IsOptional() @IsString()
  orderAmount?: string | null;

  @ApiPropertyOptional({ type: String, example: '100.00' })
  @IsOptional() @IsString()
  bi1?: string | null;

  @ApiPropertyOptional({ type: String, example: '20.99' })
  @IsOptional() @IsString()
  bi2?: string | null;

  @ApiPropertyOptional({ type: String, example: '21.00' })
  @IsOptional() @IsString()
  tva1?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  tva2?: string | null;

  @ApiPropertyOptional({ type: String, example: '0' })
  @IsOptional() @IsString()
  valueEm?: string | null;

  @ApiPropertyOptional({ type: String, example: '9.99' })
  @IsOptional() @IsString()
  upsellingAmount?: string | null;

  @ApiPropertyOptional({ example: 'OFFER-1' })
  @IsOptional() @IsString()
  upsellingOffer?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  discount?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  clubCardFee?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  clubCardDiscount?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  noArticleAmount?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  bavAmount?: string | null;

  @ApiPropertyOptional({ example: 'BAV-REF' })
  @IsOptional() @IsString()
  bavOrder?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  amountDue?: string | null;

  @ApiPropertyOptional({ type: String, example: '0.00' })
  @IsOptional() @IsString()
  generatedBavAmount?: string | null;

  // ───────────── Flags / estados auxiliares ─────────────
  @ApiProperty({ example: false })
  @IsBoolean()
  isPaid!: boolean;

  @ApiPropertyOptional({ type: String, format: 'date', example: '2025-08-11' })
  @IsOptional() @IsDateString()
  paidAt?: string | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  isInvoiced!: boolean;

  @ApiPropertyOptional({ type: String, format: 'date', example: '2025-08-11' })
  @IsOptional() @IsDateString()
  invoicedAt?: string | null;

  @ApiProperty({ example: 2 })
  @IsNumber()
  orderLines!: number;

  @ApiProperty({ example: 1.25 })
  @IsNumber()
  weight!: number;

  @ApiPropertyOptional({ example: 'requested' })
  @IsOptional() @IsString()
  returnStatus?: string | null;

  @ApiPropertyOptional({ example: 'standard' })
  @IsOptional() @IsString()
  shippingType?: string | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  isCallcenter!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isStockReserved!: boolean;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional() @IsString()
  lastLetter?: string | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  isUpselling!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isUpsellingPurchase!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isDeferred!: boolean;

  @ApiPropertyOptional({ example: 'DHL' })
  @IsOptional() @IsString()
  transport?: string | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPrivileged!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isShippedBySupplier!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPartiallyShippedBySupplier!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isSupplier!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isSubstitute!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isNoArticle!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isBav!: boolean;

  @ApiPropertyOptional({ example: 'NEXT-001' })
  @IsOptional() @IsString()
  nextAvailableNumber?: string | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  isGeneratedBav!: boolean;

  // ───────────── Estado principal (ENUM) ─────────────
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  // ───────────── Anulación ─────────────
  @ApiProperty({ example: false })
  @IsBoolean()
  isAnnulled!: boolean;

  @ApiPropertyOptional({ type: String, format: 'date', example: '2025-08-12' })
  @IsOptional() @IsDateString()
  annulledDate?: string | null;

  @ApiPropertyOptional({ example: 'admin@company.com' })
  @IsOptional() @IsString()
  annulledBy?: string | null;

  // ───────────── Auditoría ─────────────
  @ApiPropertyOptional({ example: 'user@company.com' })
  @IsOptional() @IsString()
  createdBy?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', example: '2025-08-12T10:00:00.000Z' })
  @IsOptional() @IsDateString()
  createdAt?: string; // en response será requerido

  @ApiPropertyOptional({ example: 'user2@company.com' })
  @IsOptional() @IsString()
  modifiedBy?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', example: '2025-08-12T10:00:00.000Z' })
  @IsOptional() @IsDateString()
  modifiedAt?: string; // en response será requerido
}