import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { Site } from './site.entity';
import { User } from './user.entity';
import { AssetMaintenancePlan } from './asset-maintenance-plan.entity';

@Entity('asset_maintenance_records')
export class AssetMaintenanceRecord {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'plan_id', type: 'bigint' })
  planId: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column({ name: 'asset_id', type: 'bigint' })
  assetId: number;

  @Column({ name: 'performed_at', type: 'timestamptz' })
  performedAt: Date;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  incidents: string;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => AssetMaintenancePlan)
  @JoinColumn({ name: 'plan_id' })
  plan: AssetMaintenancePlan;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
