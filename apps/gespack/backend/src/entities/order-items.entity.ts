import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { Order } from './orders.entity';
import { Product } from './product.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('increment', { name: 'order_item_id' })
  orderItemId!: number;

  @Column('bigint', { name: 'site_id' })
  siteId!: number;

  @Column('bigint', { name: 'order_id' })
  orderId!: number;

  @Column('int', { name: 'line_number', nullable: true })
  lineNumber?: number;

  @Column('bigint', { name: 'product_id', nullable: true })
  productId?: number;

  @Column('text', { name: 'product_ref', nullable: true })
  productRef?: string;

  @Column('text', { name: 'catalog_ref', nullable: true })
  catalogRef?: string;

  @Column('text', { name: 'catalog_code', nullable: true })
  catalogCode?: string;

  @Column('int', { name: 'quantity', nullable: true })
  quantity?: number;

  @Column('text', { name: 'product_description', nullable: true })
  productDescription?: string;

  @Column('decimal', { name: 'unit_price', precision: 19, scale: 4, nullable: true })
  unitPrice?: number;

  @Column('decimal', { name: 'line_total', precision: 19, scale: 4, nullable: true })
  lineTotal?: number;

  @Column('text', { name: 'is_refunded', nullable: true })
  isRefunded?: string;

  @Column('boolean', { name: 'is_stock_reserved', default: false })
  isStockReserved?: boolean;

  @Column('boolean', { name: 'is_substitute', default: false })
  isSubstitute?: boolean;

  @Column('boolean', { name: 'is_unavailable', default: false })
  isUnavailable?: boolean;

  @Column('text', { name: 'apology_phrase', nullable: true })
  apologyPhrase?: string;

  @Column('boolean', { name: 'is_supplier_shipped', default: false })
  isSupplierShipped?: boolean;

  @Column('text', { name: 'created_by', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column('text', { name: 'updated_by', nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site?: Site;

  @ManyToOne(() => Order)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'order_id', referencedColumnName: 'orderId' }
  ])
  order?: Order;

  @ManyToOne(() => Product)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'product_id', referencedColumnName: 'productId' }
  ])
  product?: Product;
}
