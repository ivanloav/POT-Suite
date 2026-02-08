import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { User } from './user.entity';
import { Customer } from './customers.entity';
import { CustomerMarkedType } from './customer-marked-types.entity';

@Entity({ name: 'customer_marked' })
@Unique('uq_customer_marked_site_name', ['siteId', 'markedName'])
@Index('idx_customer_marked_site_id', ['siteId'])
@Index('idx_customer_marked_updated_at', ['siteId', 'modifiedAt'])
export class CustomerMarked {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'marked_id' })
  markedId!: number;

  @Column({ type: 'bigint', name: 'customer_id' })
  customerId!: number;
  
  @Column({ type: 'bigint', name: 'site_id' })
  siteId!: number;

  @Column({ type: 'text', name: 'source_marked', nullable: true })
  sourceMarked!: string | null;

  @Column({ type: 'text', name: 'name' })
  markedName!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string | null;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

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

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => CustomerMarkedType)
  @JoinColumn({ name: 'marked_type_id' })
  markedType!: CustomerMarkedType;
}