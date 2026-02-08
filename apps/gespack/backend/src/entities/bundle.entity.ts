import {
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import { Product } from "./product.entity";
  import { Order } from "./orders.entity"; // solo si se relaciona con Order
  
  @Entity("bundles")
  export class Bundle {
    @PrimaryColumn({ type: "bigint" })
    siteId: number;
  
    @PrimaryGeneratedColumn()
    bundleItemId: number;
  
    @Column({ type: "int", nullable: true })
    bundleId: number;
  
    @Column({ type: "bigint" })
    productId: number;
  
    @Column({ type: "bigint", nullable: true })
    orderId: number;
  
    @Column({ type: "text", nullable: true })
    skuBundle: string;
  
    @Column({ type: "text", nullable: true })
    skuWms: string;
  
    @Column({ type: "int", nullable: true })
    qty: number;
  
    @Column({ type: "timestamp", nullable: true })
    dateCreation: Date;
  
    @Column({ type: "text", nullable: true })
    createdBy: string;
  
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
  
    @Column({ type: "text", nullable: true })
    modifiedBy: string;
  
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    modifiedAt: Date;
  
    @Column({ type: "boolean", default: false })
    isActive: boolean;
  
    // 🔗 Relaciones
  
    @ManyToOne(() => Product, (product) => product.bundles)
    @JoinColumn([
      { name: "siteId", referencedColumnName: "siteId" },
      { name: "productId", referencedColumnName: "productId" },
    ])
    product: Product;
      
    // Si también se relaciona con orders
    @ManyToOne(() => Order)
    @JoinColumn([
      { name: "siteId", referencedColumnName: "siteId" },
      { name: "orderId", referencedColumnName: "orderId" },
    ])
    order: Order;
  }
  