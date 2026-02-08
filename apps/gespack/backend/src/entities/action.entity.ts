import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { Brand } from "./brand.entity";
import { ActionCategory } from "./action-categories.entity";

@Entity("actions")
@Unique("uq_actions_site_action_name", ["siteId", "actionName"])
@Unique("uq_actions_site_action_id", ["siteId", "actionId"])
@Index("idx_actions_action_id", ["siteId", "actionId"])
@Index("idx_actions_action_name", ["siteId", "actionName"])
export class Action {
  @PrimaryGeneratedColumn({ name: "action_id", type: "bigint" })
  actionId!: number; // bigint → string en TS

  @Column({ name: "site_id", type: "bigint" })
  siteId!: number;

  @Column({ name: "action_name", type: "text" })
  actionName!: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "launch_date", type: "timestamp" })
  launchDate!: Date;

  @Column({ name: "brand_id", type: "bigint" })
  brandId!: number;

  @Column({ name: "print_run", type: "bigint", nullable: true })
  printRun?: number;

  @Column({ name: "deposit_date", type: "timestamp" })
  depositDate!: Date;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "catalog_code", type: "text", nullable: true })
  catalogCode?: string;

  @Column({ name: "catalog_lot", type: "text", nullable: true })
  catalogLot?: string;

  @Column({ name: "catalog_description", type: "text", nullable: true })
  catalogDescription?: string;

  @Column({ name: "action_category_id", type: "bigint", nullable: true })
  actionCategoryId?: number;

  @Column({ name: "created_by", type: "text", nullable: true })
  createdBy?: string;

  @Column({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @Column({ name: "updated_by", type: "text", nullable: true })
  modifiedBy?: string;

  @Column({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  modifiedAt!: Date;

  // 🔗 Relaciones
  @ManyToOne(() => Brand)
  @JoinColumn([
    { name: "site_id", referencedColumnName: "siteId" },
    { name: "brand_id", referencedColumnName: "brandId" },
  ])
  brand?: Brand;

  @ManyToOne(() => ActionCategory)
  @JoinColumn([
    { name: "site_id", referencedColumnName: "siteId" },
    { name: "action_category_id", referencedColumnName: "actionCategoryId" },
  ])
  actionCategory?: ActionCategory;
}