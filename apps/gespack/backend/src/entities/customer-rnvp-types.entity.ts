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
import { Site } from './site.entity';       // <- Descomenta si tienes la entidad
import { User } from './user.entity';       // <- Descomenta si tienes la entidad

@Entity({ name: 'customer_rnvp_types' })
@Unique('uq_customer_rnvp_types_site_name', ['siteId', 'name'])
@Index('idx_customer_rnvp_types_site_id', ['siteId'])
@Index('idx_customer_rnvp_types_updated_at', ['siteId', 'modifiedAt'])
export class CustomerRnvpType {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'rnvp_type_id' })
  rnvpTypeId!: number; // BIGINT -> string

  @Column({ type: 'bigint', name: 'site_id' })
  siteId!: number; // BIGINT -> string

  @Column({ type: 'text', name: 'name' })
  name!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string;

  @Column({ type: 'text', name: 'created_by', nullable: true })
  createdBy?: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @Column({ type: 'bigint', name: 'updated_by', nullable: true })
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