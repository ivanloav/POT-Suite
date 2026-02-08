import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { CustomerRnvpType } from "./customer-rnvp-types.entity";
import { CustomerMarked } from "./customer-marked.entity";
import { CustomerType } from "./customer-types.entity";

@Entity("customers")
@Unique("uq_customers_site_customer_code", ["siteId", "customerCode"])
@Unique("uq_customers_site_customer_id", ["siteId", "customerId"])
@Index("idx_customers_code", ["siteId", "customerCode"])
@Index("idx_customers_last_name", ["customerLastName"])
export class Customer {
  @PrimaryGeneratedColumn({ name: "customer_id", type: "bigint" })
  customerId!: number;

  @Column({ name: "site_id", type: "bigint" })
  siteId!: number;

  @Column({ name: "customer_code", type: "bigint" })
  customerCode!: number;

  @Column({ name: "customer_gender", type: "text", nullable: true })
  customerGender?: string;

  @Column({ name: "customer_first_name", type: "text", nullable: true })
  customerFirstName?: string;

  @Column({ name: "customer_last_name", type: "text", nullable: true })
  customerLastName?: string;

  // Facturación
  @Column({ name: "billing_gender", type: "text", nullable: true })
  billingGender?: string;

  @Column({ name: "billing_first_name", type: "text", nullable: true })
  billingFirstName?: string;

  @Column({ name: "billing_last_name", type: "text", nullable: true })
  billingLastName?: string;

  @Column({ name: "billing_address_line1", type: "text", nullable: true })
  billingAddressLine1?: string;

  @Column({ name: "billing_address_line2", type: "text", nullable: true })
  billingAddressLine2?: string;

  @Column({ name: "billing_address_line3", type: "text", nullable: true })
  billingAddressLine3?: string;

  @Column({ name: "billing_address_line4", type: "text", nullable: true })
  billingAddressLine4?: string;

  @Column({ name: "billing_address_cp", type: "text", nullable: true })
  billingAddressCp?: string;

  @Column({ name: "billing_address_city", type: "text", nullable: true })
  billingAddressCity?: string;

  @Column({ name: "billing_address_country", type: "text", nullable: true })
  billingAddressCountry?: string;

  @Column({ name: "billing_mobile_phone", type: "text", nullable: true })
  billingMobilePhone?: string;

  // Envío
  @Column({ name: "shipping_gender", type: "text", nullable: true })
  shippingGender?: string;

  @Column({ name: "shipping_first_name", type: "text", nullable: true })
  shippingFirstName?: string;

  @Column({ name: "shipping_last_name", type: "text", nullable: true })
  shippingLastName?: string;

  @Column({ name: "shipping_address_line1", type: "text", nullable: true })
  shippingAddressLine1?: string;

  @Column({ name: "shipping_address_line2", type: "text", nullable: true })
  shippingAddressLine2?: string;

  @Column({ name: "shipping_address_line3", type: "text", nullable: true })
  shippingAddressLine3?: string;

  @Column({ name: "shipping_address_line4", type: "text", nullable: true })
  shippingAddressLine4?: string;

  @Column({ name: "shipping_address_cp", type: "text", nullable: true })
  shippingAddressCp?: string;

  @Column({ name: "shipping_address_city", type: "text", nullable: true })
  shippingAddressCity?: string;

  @Column({ name: "shipping_address_country", type: "text", nullable: true })
  shippingAddressCountry?: string;
  
  @Column({ name: "shipping_mobile_phone", type: "text", nullable: true })
  shippingMobilePhone?: string;

  @Column({ name: "phone", type: "text", nullable: true })
  phone?: string;

  @Column({ name: "customer_type_id", type: "bigint", nullable: true })
  customerTypeId?: number;

  @Column({ name: "birth_date", type: "date", nullable: true })
  birthDate?: string;

  @Column({ name: "npai", type: "text", nullable: true })
  npai?: string;

  @Column({ name: "rfm", type: "text", nullable: true })
  rfm?: string;

  @Column({ name: "rnvp_type_id", type: "int", nullable: true })
  rnvpTypeId?: number;

  @Column({ name: "email", type: "text", nullable: true })
  email?: string;

  @Column({ name: "privileged", type: "boolean", default: false })
  privileged!: boolean;

  @Column({ name: "privileged_date", type: "date", nullable: true })
  privilegedDate?: string;

  @Column({ name: "is_active", type: "boolean", default: false })
  isActive: boolean;

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

  // Relaciones
  @ManyToOne(() => CustomerRnvpType)
  @JoinColumn([
    { name: "site_id", referencedColumnName: "siteId" },
    { name: "rnvp_type_id", referencedColumnName: "rnvpTypeId" },
  ])
  rnvpType?: CustomerRnvpType;

  @ManyToOne(() => CustomerType)
  @JoinColumn([
    { name: "site_id", referencedColumnName: "siteId" },
    { name: "customer_type_id", referencedColumnName: "customerTypeId" },
  ])
  customerType?: CustomerType;
}