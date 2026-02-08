import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Product } from "./product.entity";

@Entity("brands")
export class Brand {
  @PrimaryColumn({ type: "bigint", name: 'site_id' })
  siteId: number;

  @PrimaryColumn({ type: "bigint", name: 'brand_id' })
  brandId: number;

  @Column({ type: "text", name: 'brand_name' })
  brandName: string;

  @Column({ type: "text", nullable: true, name: 'description' })
  description: string;

  @Column({ type: "date", nullable: true, name: 'start_date' })
  startDate: Date;

  @Column({ type: "date", nullable: true, name: 'end_date' })
  endDate: Date;

  @Column({ type: "boolean", default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: "text", nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: 'created_at' })
  createdAt: Date;

  @Column({ type: "text", nullable: true, name: 'updated_by' })
  modifiedBy: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", name: 'updated_at' })
  modifiedAt: Date;

  @OneToMany(() => Product, (p) => p.brand)
  products!: Product[];
}