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
import { StorageDriveType } from './asset-storage-drive-type.entity';
import { StorageInterface } from './asset-storage-interface.entity';
import { StorageFormFactor } from './asset-storage-form-factor.entity';

@Entity('asset_storage_options')
export class StorageOption {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'capacity_gb', type: 'int' })
  capacityGb: number;

  @Column({ name: 'drive_type_id', type: 'bigint' })
  driveTypeId: number;

  @ManyToOne(() => StorageDriveType, { eager: true })
  @JoinColumn({ name: 'drive_type_id' })
  driveType: StorageDriveType;

  @Column({ name: 'interface_id', type: 'bigint', nullable: true })
  interfaceId: number | null;

  @ManyToOne(() => StorageInterface, { nullable: true, eager: true })
  @JoinColumn({ name: 'interface_id' })
  interface: StorageInterface | null;

  @Column({ name: 'form_factor_id', type: 'bigint', nullable: true })
  formFactorId: number | null;

  @ManyToOne(() => StorageFormFactor, { nullable: true, eager: true })
  @JoinColumn({ name: 'form_factor_id' })
  formFactor: StorageFormFactor | null;

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

  @OneToMany(() => Asset, (asset) => asset.storage)
  assets: Asset[];
}
