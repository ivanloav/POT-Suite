import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';
import { Bundle } from './bundle.entity';

@Entity({ name: 'products' })
@Index('uq_products_site_product_ref', ['siteId', 'productRef'], { unique: true })
export class Product {
  // BIGINT IDENTITY → string (sin transformers)
  @PrimaryGeneratedColumn({ name: 'product_id', type: 'bigint' })
  productId!: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId!: number;

  @Column({ name: 'product_ref', type: 'text' })
  productRef!: string;

  @Column({ name: 'catalog', type: 'text', nullable: true })
  catalog?: string | null;

  @Column({ name: 'brand_id', type: 'bigint' })
  brandId!: number;

  @Column({ name: 'action', type: 'text', nullable: true })
  action?: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'weight', type: 'numeric', precision: 10, scale: 3, nullable: true })
  weight?: number | null;

  @Column({ name: 'vat', type: 'numeric', precision: 10, scale: 3, nullable: true })
  vat?: number | null;

  @Column({ name: 'picking_location', type: 'text', nullable: true })
  pickingLocation?: string | null;

  @Column({ name: 'storage_location', type: 'text', nullable: true })
  storageLocation?: string | null;

  @Column({ name: 'packaging', type: 'bigint', nullable: true })
  packaging?: number | null;

  @Column({ name: 'price', type: 'numeric', precision: 19, scale: 4, nullable: true, transformer: {
    to: (value: number | null) => (value == null ? null : value),
    from: (value: string | number | null) => (value == null || value === '' ? null : Number(value)),
  } })
  price?: number | null;

  @Column({ name: 'units_per_pack', type: 'bigint', nullable: true })
  unitsPerPack?: number | null;

  @Column({ name: 'stock', type: 'bigint', nullable: true })
  stock?: number | null;

  @Column({ name: 'cost', type: 'numeric', precision: 19, scale: 4, nullable: true })
  cost?: number | null;

  @Column({ name: 'additional_info', type: 'text', nullable: true })
  additionalInfo?: string | null;

  @Column({ name: 'vat_type', type: 'smallint', nullable: true })
  vatType?: number | null;

  @Column({ name: 'status', type: 'text', nullable: true })
  status?: string | null;

  @Column({ name: 'blocked_stock', type: 'bigint', nullable: true })
  blockedStock?: number | null;

  @Column({ name: 'is_shipped_by_supplier', type: 'boolean', default: false })
  isShippedBySupplier!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  modifiedBy?: string | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  modifiedAt!: Date;

  /** ----------------- RELACIONES ----------------- **/
  @ManyToOne(() => Brand, (b) => b.products, {
    onDelete: 'RESTRICT',
    eager: false,
  })

  @OneToMany(() => Bundle, (b) => b.product)
  bundles!: Bundle[];

  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'brand_id', referencedColumnName: 'brandId' },
  ])
  brand!: Brand;
}