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
import { AssetRamMemoryType } from './asset-ram-memory-type.entity';
import { AssetRamFormFactor } from './asset-ram-form-factor.entity';

@Entity('asset_ram_options')
export class AssetRamOption {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'capacity_gb', type: 'int' })
  capacityGb: number;

  @Column({ name: 'mem_type_id', type: 'bigint' })
  memTypeId: number;

  @ManyToOne(() => AssetRamMemoryType, { eager: true })
  @JoinColumn({ name: 'mem_type_id' })
  memType: AssetRamMemoryType;

  @Column({ name: 'speed_mts', type: 'int', nullable: true })
  speedMts: number | null;

  @Column({ name: 'form_factor_id', type: 'bigint', nullable: true })
  formFactorId: number | null;

  @ManyToOne(() => AssetRamFormFactor, { nullable: true, eager: true })
  @JoinColumn({ name: 'form_factor_id' })
  formFactor: AssetRamFormFactor | null;

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

  @OneToMany(() => Asset, (asset) => asset.ram)
  assets: Asset[];
}
