import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './orders.entity';
import { Site } from './site.entity';

@Entity('order_addresses')
export class OrderAddress {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'address_id' })
  addressId: number;

  @Column({ type: 'bigint', name: 'order_id' })
  orderId: number;

  @Column({ type: 'int', name: 'site_id' })
  siteId: number;

  @Column({ type: 'text', name: 'order_reference' })
  orderReference: string;

  // Dirección de facturación
  @Column({ type: 'text', name: 'billing_customer_name', nullable: true })
  billingCustomerName?: string;

  @Column({ type: 'text', name: 'billing_address_line1', nullable: true })
  billingAddressLine1?: string;

  @Column({ type: 'text', name: 'billing_address_line2', nullable: true })
  billingAddressLine2?: string;

  @Column({ type: 'text', name: 'billing_address_line3', nullable: true })
  billingAddressLine3?: string;

  @Column({ type: 'text', name: 'billing_address_line4', nullable: true })
  billingAddressLine4?: string;

  @Column({ type: 'text', name: 'billing_address_line5', nullable: true })
  billingAddressLine5?: string;

  @Column({ type: 'text', name: 'billing_postal_code', nullable: true })
  billingPostalCode?: string;

  @Column({ type: 'text', name: 'billing_city', nullable: true })
  billingCity?: string;

  @Column({ type: 'text', name: 'billing_mobile_phone', nullable: true })
  billingMobilePhone?: string;

  // Dirección de envío
  @Column({ type: 'text', name: 'shipping_customer_name', nullable: true })
  shippingCustomerName?: string;

  @Column({ type: 'text', name: 'shipping_address_line1', nullable: true })
  shippingAddressLine1?: string;

  @Column({ type: 'text', name: 'shipping_address_line2', nullable: true })
  shippingAddressLine2?: string;

  @Column({ type: 'text', name: 'shipping_address_line3', nullable: true })
  shippingAddressLine3?: string;

  @Column({ type: 'text', name: 'shipping_address_line4', nullable: true })
  shippingAddressLine4?: string;

  @Column({ type: 'text', name: 'shipping_address_line5', nullable: true })
  shippingAddressLine5?: string;

  @Column({ type: 'text', name: 'shipping_postal_code', nullable: true })
  shippingPostalCode?: string;

  @Column({ type: 'text', name: 'shipping_city', nullable: true })
  shippingCity?: string;

  @Column({ type: 'text', name: 'shipping_mobile_phone', nullable: true })
  shippingMobilePhone?: string;

  // Auditoría
  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'text', name: 'modified_by', nullable: true })
  modifiedBy?: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @ManyToOne(() => Order)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'order_id', referencedColumnName: 'orderId' }
  ])
  order: Order;
}
