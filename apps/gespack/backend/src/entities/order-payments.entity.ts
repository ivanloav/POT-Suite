import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { OrderPaymentsCardType } from './order-payments-card-types.entity';
import { OrderPaymentTypes } from './order-payment-types.entity';

@Entity('order_payments')
export class OrderPayments {
  @PrimaryGeneratedColumn({ name: 'order_payments_id', type: 'bigint' })
  orderPaymentsId: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @Column({ name: 'payment_type_id', type: 'bigint' })
  paymentTypeId: number;

  @Column({ name: 'is_deferred', type: 'boolean', default: false })
  isDeferred: boolean;

  @Column({ name: 'schedule_count', type: 'int', default: 1 })
  scheduleCount: number;

  @Column({ name: 'holder_name', type: 'text', nullable: true })
  holderName?: string;

  @Column({ name: 'amount', type: 'numeric', precision: 19, scale: 4 })
  amount: number;

  // Cheque fields
  @Column({ name: 'bank_name', type: 'text', nullable: true })
  bankName?: string;

  @Column({ name: 'cheque_number', type: 'text', nullable: true })
  chequeNumber?: string;

  // Card fields
  @Column({ name: 'card_type_id', type: 'int', nullable: true })
  cardTypeId?: number;

  @Column({ name: 'card_number', type: 'text', nullable: true })
  cardNumber?: string;

  @Column({ name: 'expiration_date', type: 'varchar', length: 5, nullable: true })
  expirationDate?: string;

  @Column({ name: 'security_code', type: 'int', nullable: true })
  securityCode?: number;

  // Payment status
  @Column({ name: 'is_unpaid', type: 'boolean', default: false })
  isUnpaid: boolean;

  @Column({ name: 'unpaid_amount', type: 'numeric', precision: 19, scale: 4, nullable: true })
  unpaidAmount?: string;

  @Column({ name: 'unpaid_date', type: 'date', nullable: true })
  unpaidDate?: Date;

  @Column({ name: 'is_recovered', type: 'boolean', default: false })
  isRecovered: boolean;

  @Column({ name: 'recovered_amount', type: 'numeric', precision: 19, scale: 4, nullable: true })
  recoveredAmount?: string;

  @Column({ name: 'recovery_date', type: 'date', nullable: true })
  recoveryDate?: Date;

  @Column({ name: 'is_uncollectible', type: 'boolean', default: false })
  isUncollectible: boolean;

  @Column({ name: 'uncollectible_amount', type: 'numeric', precision: 19, scale: 4, nullable: true })
  uncollectibleAmount?: string;

  @Column({ name: 'uncollectible_date', type: 'date', nullable: true })
  uncollectibleDate?: Date;

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;

  @ManyToOne(() => OrderPaymentTypes)
  @JoinColumn({ name: 'payment_type_id', referencedColumnName: 'orderPaymentTypeId' })
  paymentType: OrderPaymentTypes;

  @ManyToOne(() => OrderPaymentsCardType, { nullable: true })
  @JoinColumn({ name: 'card_type_id', referencedColumnName: 'cardTypeId' })
  cardType?: OrderPaymentsCardType;
}