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

@Entity({ name: 'customer_marked_types' })
@Unique('uq_customer_marked_types_site_name', ['siteId', 'markedTypeName'])
@Index('idx_customer_marked_types_site_id', ['siteId'])
@Index('idx_customer_marked_types_updated_at', ['siteId', 'modifiedAt'])
export class CustomerMarkedType {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'marked_type_id' })
  markedTypeId!: number;
  
  @Column({ type: 'bigint', name: 'site_id' })
  siteId!: number;

  @Column({ type: 'text', name: 'name' })
  markedTypeName!: string;

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
}