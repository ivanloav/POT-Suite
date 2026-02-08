import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Site } from './site.entity';
import { OrderPaymentTypeFields } from './order-payment-type-fields.entity';

@Entity('order_payment_types')
export class OrderPaymentTypes {
  @PrimaryGeneratedColumn({ name: 'order_payment_type_id', type: 'bigint' })
  orderPaymentTypeId: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column({ name: 'payment_type', type: 'text' })
  paymentType: string;
  
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
  
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

  @OneToMany(() => OrderPaymentTypeFields, field => field.paymentType)
  fields: OrderPaymentTypeFields[];
}