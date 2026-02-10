import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { User } from './user.entity';
import { CpuVendor } from './asset-cpu-vendor.entity';
import { CpuSegment } from './asset-cpu-segment.entity';

@Entity('asset_cpus')
export class AssetCpu {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'vendor_id', type: 'bigint' })
  vendorId: number;

  @ManyToOne(() => CpuVendor, { eager: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: CpuVendor;

  @Column({ type: 'text' })
  model: string;

  @Column({ name: 'segment_id', type: 'bigint', nullable: true })
  segmentId: number | null;

  @ManyToOne(() => CpuSegment, { nullable: true, eager: true })
  @JoinColumn({ name: 'segment_id' })
  segment: CpuSegment | null;

  @Column({ type: 'int', nullable: true })
  cores: number | null;

  @Column({ type: 'int', nullable: true })
  threads: number | null;

  @Column({ name: 'base_ghz', type: 'decimal', precision: 4, scale: 2, nullable: true })
  baseGhz: number | null;

  @Column({ name: 'boost_ghz', type: 'decimal', precision: 4, scale: 2, nullable: true })
  boostGhz: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @OneToMany(() => Asset, (asset) => asset.cpu)
  assets: Asset[];
}
