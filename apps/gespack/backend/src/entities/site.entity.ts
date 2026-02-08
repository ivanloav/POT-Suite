import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("sites")
export class Site {
  @PrimaryGeneratedColumn({ name: 'site_id', type: "bigint" })
  siteId: number;

  @Column({ name: 'site_name', type: "text", unique: true })
  siteName: string;

  @Column({ name: 'site_description', type: "text", nullable: true })
  siteDescription: string;

  @Column({ name: 'contact_info', type: "text", nullable: true })
  contactInfo: string;

  @Column({ name: 'is_active', type: "boolean", default: false })
  isActive: boolean;

  @Column({ name: 'created_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ name: 'updated_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
