import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Site } from './site.entity';
import { User } from './user.entity';

@Entity('asset_maintenance_plans')
export class AssetMaintenancePlan {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column({ name: 'asset_id', type: 'bigint' })
  assetId: number;

  @Column()
  title: string;

  @Column({ name: 'maintenance_type', nullable: true })
  maintenanceType: string;

  @Column({ type: 'varchar', length: 20, default: 'media' })
  priority: string; // 'baja', 'media', 'alta', 'critica'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_recurring', type: 'boolean', default: true })
  isRecurring: boolean;

  @Column({ name: 'frequency_days', type: 'int', nullable: true })
  frequencyDays: number | null;

  @Column({ name: 'next_due_date', type: 'date' })
  nextDueDate: Date | string;

  @Column({ name: 'last_done_at', type: 'timestamptz', nullable: true })
  lastDoneAt: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToMany('AssetMaintenanceRecord', 'plan')
  records: any[];
}
