import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
  Check,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { User } from './user.entity';

@Entity({ name: 'customer_types' })
@Unique('uq_customer_types_site_code', ['siteId', 'typeCode'])
@Index('idx_customer_types_site_id', ['siteId'])
@Index('idx_customer_types_is_active', ['siteId', 'isActive'])
@Index('idx_customer_types_updated_at', ['siteId', 'modifiedAt'])
@Check('chk_customer_types_type_code_pos', '"type_code" > 0')
@Check('chk_customer_types_type_name_not_blank', "btrim(\"type_name\") <> ''")
export class CustomerType {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'customer_type_id' })
  customerTypeId!: number;

  @Column({ type: 'bigint', name: 'site_id' })
  siteId!: number;

  @Column({ type: 'integer', name: 'type_code' })
  typeCode!: number;

  @Column({ type: 'text', name: 'type_name' })
  typeName!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: () => 'true' })
  isActive!: boolean;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({ type: 'text', name: 'updated_by', nullable: true })
  modifiedBy?: string | null;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  modifiedAt!: Date;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site?: Site;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  modifiedByUser?: User | null;
}