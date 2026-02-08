import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../entities/orders.entity';

export class OrderResponseDto {
  @ApiProperty()
  orderId: number;

  @ApiProperty()
  siteId: number;

  @ApiProperty()
  orderDatetime: Date | null;

  @ApiProperty()
  orderReference: string;

  @ApiProperty()
  brandId: number;

  @ApiProperty()
  source?: string | null;

  @ApiProperty()
  actionId?: number | null;

  @ApiProperty()
  actionCategoryId: number;

  @ApiProperty()
  actionPriorityId?: number | null;

  @ApiProperty()
  shippingCost?: number | null;

  @ApiProperty()
  mandatoryShippingFee?: number | null;

  @ApiProperty()
  customerId?: number | null;

  @ApiProperty()
  gender?: string | null;

  @ApiProperty()
  firstName?: string | null;

  @ApiProperty()
  lastName?: string | null;

  @ApiProperty()
  paymentTypeId: number;

  @ApiProperty()
  isPaid: boolean;

  @ApiProperty()
  paidAt?: Date | null;

  @ApiProperty()
  isInvoiced: boolean;

  @ApiProperty()
  invoicedAt?: Date | null;

  @ApiProperty()
  orderLines: number;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  clientType?: number | null;

  @ApiProperty()
  participant?: string | null;

  @ApiProperty()
  orderAmount?: number | null;

  @ApiProperty()
  bi1?: number | null;

  @ApiProperty()
  bi2?: number | null;

  @ApiProperty()
  tva1?: number | null;

  @ApiProperty()
  tva2?: number | null;

  @ApiProperty()
  returnStatus?: string | null;

  @ApiProperty()
  shippingType?: string | null;

  @ApiProperty()
  valueEm?: number | null;

  @ApiProperty()
  isCallcenter: boolean;

  @ApiProperty()
  isStockReserved: boolean;

  @ApiProperty()
  lastLetter?: string | null;

  @ApiProperty()
  isUpselling: boolean;

  @ApiProperty()
  isUpsellingPurchase: boolean;

  @ApiProperty()
  upsellingAmount?: number | null;

  @ApiProperty()
  upsellingOffer?: string | null;

  @ApiProperty()
  isDeferred: boolean;

  @ApiProperty()
  transport?: string | null;

  @ApiProperty()
  discount?: number | null;

  @ApiProperty()
  isPrivileged: boolean;

  @ApiProperty()
  clubCardFee?: number | null;

  @ApiProperty()
  clubCardDiscount?: number | null;

  @ApiProperty()
  isShippedBySupplier: boolean;

  @ApiProperty()
  isPartiallyShippedBySupplier: boolean;

  @ApiProperty()
  isSupplier: boolean;

  @ApiProperty()
  isSubstitute: boolean;

  @ApiProperty()
  isNoArticle: boolean;

  @ApiProperty()
  noArticleAmount?: number | null;

  @ApiProperty()
  isBav: boolean;

  @ApiProperty()
  bavAmount?: number | null;

  @ApiProperty()
  bavOrder?: string | null;

  @ApiProperty()
  amountDue?: number | null;

  @ApiProperty()
  nextAvailableNumber?: string | null;

  @ApiProperty()
  isGeneratedBav: boolean;

  @ApiProperty()
  generatedBavAmount?: number | null;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  isAnnulled: boolean;

  @ApiProperty()
  annulledDate?: Date | null;

  @ApiProperty()
  annulledBy?: string | null;

  @ApiProperty()
  createdBy?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  modifiedBy?: string | null;

  @ApiProperty()
  modifiedAt: Date;
}