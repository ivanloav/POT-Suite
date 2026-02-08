import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Customer } from './customers.entity';
import { Brand } from './brand.entity';
import { Action } from './action.entity';
import { ActionCategory } from './action-categories.entity';
import { ActionPriorityType } from './action-priority-types.entity';
import { OrderPayments } from './order-payments.entity';
import { Site } from './site.entity';
import { OrderSource } from './order-sources.entity';

export enum OrderStatus {
  PENDING   = 'pending',
  PAID      = 'paid',
  RESERVED  = 'reserved',
  SHIPPED   = 'shipped',
  INVOICED  = 'invoiced',
  RETURNED  = 'returned',
  CANCELLED = 'cancelled',
}

@Entity('orders')
@Unique('uq_orders_site_order_ref', ['siteId', 'orderReference'])
@Unique('uq_orders_site_order_id', ['siteId', 'orderId'])
@Index('idx_orders_site_status', ['siteId', 'status'])
@Index('idx_orders_order_id', ['orderId'])
@Index('idx_orders_customer_id', ['customerId'])
@Index('idx_orders_site_source', ['siteId', 'orderSourceId'])
export class Order {
  /** PK autoincremental como en el DDL */
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'order_id' })
  orderId!: number;

  @Column('bigint', { name: 'site_id' })
  siteId!: number;

  @Column({ type: 'timestamp', name: 'order_datetime', nullable: true })
  orderDatetime!: Date | null;

  @Column({ type: 'text', name: 'order_reference' })
  orderReference!: string;

  @Column('bigint', { name: 'brand_id' })
  brandId!: number;

  @Column({ type: 'bigint', name: 'order_source_id', nullable: true })
  orderSourceId!: number | null;

  @Column('bigint', { name: 'action_id', nullable: true })
  actionId!: number | null;

  @Column('int', { name: 'action_category_id' })
  actionCategoryId!: number;

  @Column('int', { name: 'action_priority_id', nullable: true })
  actionPriorityId!: number | null;

  @Column({ type: 'numeric', name: 'shipping_cost', precision: 19, scale: 4, nullable: true })
  shippingCost!: number | null;

  @Column({ type: 'numeric', name: 'mandatory_shipping_fee', precision: 19, scale: 4, nullable: true })
  mandatoryShippingFee!: number | null;

  @Column('bigint', { name: 'customer_id', nullable: true })
  customerId!: number | null;

  @Column({ type: 'text', name: 'gender', nullable: true })
  gender!: string | null;

  @Column({ type: 'text', name: 'first_name', nullable: true })
  firstName!: string | null;

  @Column({ type: 'text', name: 'last_name', nullable: true })
  lastName!: string | null;

  @Column('bigint', { name: 'payment_type_id' })
  paymentTypeId!: number;

  @Column({ type: 'boolean', name: 'is_paid', default: false })
  isPaid!: boolean;

  @Column({ type: 'date', name: 'paid_at', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'boolean', name: 'is_invoiced', default: false })
  isInvoiced!: boolean;

  @Column({ type: 'date', name: 'invoiced_at', nullable: true })
  invoicedAt!: Date | null;

  @Column('bigint', { name: 'order_lines', default: () => '0' })
  orderLines!: number;

  @Column({ type: 'float', name: 'weight', default: 0 })
  weight!: number;

  @Column({ type:'numeric', name: 'client_type', precision: 18, scale: 0, nullable: true })
  clientType!: number | null;

  @Column({ type: 'text', name: 'participant', nullable: true })
  participant!: string | null;

  @Column({ type:'numeric', name: 'order_amount', precision: 19, scale: 4, nullable: true })
  orderAmount!: number | null;

  @Column({ type:'numeric', name: 'bi1', precision: 19, scale: 4, nullable: true })
  bi1!: number | null;

  @Column({ type:'numeric', name: 'bi2', precision: 19, scale: 4, nullable: true })
  bi2!: number | null;

  @Column({ type:'numeric', name: 'tva1', precision: 19, scale: 4, nullable: true })
  tva1!: number | null;

  @Column({ type:'numeric', name: 'tva2', precision: 19, scale: 4, nullable: true })
  tva2!: number | null;

  @Column({ type: 'text', name: 'return_status', nullable: true })
  returnStatus!: string | null;

  @Column({ type: 'text', name: 'shipping_type', nullable: true })
  shippingType!: string | null;

  @Column('numeric', { name: 'value_em', precision: 18, scale: 0, nullable: true })
  valueEm!: string | null;

  @Column({ type: 'boolean', name: 'is_callcenter', default: false })
  isCallcenter!: boolean;

  @Column({ type: 'boolean', name: 'is_stock_reserved', default: false })
  isStockReserved!: boolean;

  @Column({ type: 'text', name: 'last_letter', nullable: true })
  lastLetter!: string | null;

  @Column({ type: 'boolean', name: 'is_upselling', default: false })
  isUpselling!: boolean;

  @Column({ type: 'boolean', name: 'is_upselling_purchase', default: false })
  isUpsellingPurchase!: boolean;

  @Column({ type: 'numeric', name: 'upselling_amount', precision: 19, scale: 4, nullable: true })
  upsellingAmount!: number | null;

  @Column({ type: 'text', name: 'upselling_offer', nullable: true })
  upsellingOffer!: string | null;

  @Column({ type: 'boolean', name: 'is_deferred', default: false })
  isDeferred!: boolean;

  @Column({ type: 'text', name: 'transport', nullable: true })
  transport!: string | null;

  @Column({ type: 'numeric', name: 'discount', precision: 19, scale: 4, nullable: true })
  discount!: number | null;

  @Column({ type: 'boolean', name: 'is_privileged', default: false })
  isPrivileged!: boolean;

  @Column({ type: 'numeric', name: 'club_card_fee', precision: 19, scale: 4, nullable: true })
  clubCardFee!: number | null;

  @Column({ type: 'numeric', name: 'club_card_discount', precision: 19, scale: 4, nullable: true })
  clubCardDiscount!: number | null;

  @Column({ type: 'boolean', name: 'is_shipped_by_supplier', default: false })
  isShippedBySupplier!: boolean;

  @Column({ type: 'boolean', name: 'is_partially_shipped_by_supplier', default: false })
  isPartiallyShippedBySupplier!: boolean;

  @Column({ type: 'boolean', name: 'is_supplier', default: false })
  isSupplier!: boolean;

  @Column({ type: 'boolean', name: 'is_substitute', default: false })
  isSubstitute!: boolean;

  @Column({ type: 'boolean', name: 'is_no_article', default: false })
  isNoArticle!: boolean;

  @Column({ type: 'numeric', name: 'no_article_amount', precision: 19, scale: 4, nullable: true })
  noArticleAmount!: number | null;

  @Column({ type: 'boolean', name: 'is_bav', default: false })
  isBav!: boolean;

  @Column({ type: 'numeric', name: 'bav_amount', precision: 19, scale: 4, nullable: true })
  bavAmount!: number | null;

  @Column({ type: 'text', name: 'bav_order', nullable: true })
  bavOrder!: string | null;

  @Column({ type: 'numeric', name: 'amount_due', precision: 19, scale: 4, nullable: true })
  amountDue!: number | null;

  @Column({ type: 'text', name: 'next_available_number', nullable: true })
  nextAvailableNumber!: string | null;

  @Column({ type: 'boolean', name: 'is_generated_bav', default: false })
  isGeneratedBav!: boolean;

  @Column({ type: 'numeric', name: 'generated_bav_amount', precision: 19, scale: 4, nullable: true })
  generatedBavAmount!: number | null;

  /** NUEVA COLUMNA ENUM como en el DDL */
  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status',
    default: OrderStatus.PENDING,
    name: 'status',
  })
  status!: OrderStatus;

  @Column({ type: 'boolean', name: 'is_annulled', default: false })
  isAnnulled!: boolean;

  @Column({ type: 'date', name: 'annulled_at', nullable: true })
  annulledAt!: Date | null;

  @Column({ type: 'text', name: 'annulled_by', nullable: true })
  annulledBy!: string | null;

  @Column({ type: 'bigint', name: 'created_by', nullable: false })
  createdBy!: number;

  @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'text', name: 'updated_by', nullable: true })
  modifiedBy!: string | null;

  @Column({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  // ───────────────────────────────── Relations ────────────────────────────────

  @ManyToOne(() => Site)
  @JoinColumn([{ name: 'site_id', referencedColumnName: 'siteId' }])
  site!: Site;

  @ManyToOne(() => Customer)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'customer_id', referencedColumnName: 'customerId' },
  ])
  customer!: Customer | null;

  @ManyToOne(() => Brand)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'brand_id', referencedColumnName: 'brandId' },
  ])
  brand!: Brand;

  @ManyToOne(() => OrderSource)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'order_source_id', referencedColumnName: 'orderSourceId' },
  ])
  orderSource!: OrderSource | null;

  @ManyToOne(() => Action)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'action_id', referencedColumnName: 'actionId' },
  ])
  action!: Action | null;

  @ManyToOne(() => ActionCategory)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'action_category_id', referencedColumnName: 'actionCategoryId' },
  ])
  actionCategory!: ActionCategory;

  @ManyToOne(() => ActionPriorityType)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'action_priority_id', referencedColumnName: 'actionPriorityId' },
  ])
  actionPriority!: ActionPriorityType | null;

  @ManyToOne(() => OrderPayments)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'payment_type_id', referencedColumnName: 'orderPaymentsId' }, // asegúrate del nombre real en esa entidad
  ])
  payment!: OrderPayments;
}