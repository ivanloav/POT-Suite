import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { OrderPaymentTypes } from './order-payment-types.entity';

@Entity('order_payment_type_fields')
export class OrderPaymentTypeFields {
  @PrimaryGeneratedColumn({ name: 'field_id', type: 'bigint' })
  fieldId: number;

  @Column({ name: 'order_payment_type_id', type: 'bigint' })
  orderPaymentTypeId: number;

  @Column({ name: 'field_name', type: 'text' })
  fieldName: string;
  
  @Column({ name: 'field_type', type: 'text', nullable: true })
  fieldType?: string;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;
  
  @Column({ name: 'field_order', type: 'int', default: 0 })
  fieldOrder: number;

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relaciones

  @ManyToOne(() => OrderPaymentTypes, paymentType => paymentType.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_payment_type_id', referencedColumnName: 'orderPaymentTypeId' })
  paymentType: OrderPaymentTypes;}