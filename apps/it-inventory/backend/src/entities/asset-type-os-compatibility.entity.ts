import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AssetType } from './asset-type.entity';
import { AssetOsFamily } from './asset-os-family.entity';
import { User } from './user.entity';

@Entity('asset_type_os_compatibility')
export class AssetTypeOsCompatibility {
  @PrimaryColumn({ name: 'type_id', type: 'bigint' })
  typeId: number;

  @PrimaryColumn({ name: 'os_family_id', type: 'bigint' })
  osFamilyId: number;

  @ManyToOne(() => AssetType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'type_id' })
  type: AssetType;

  @ManyToOne(() => AssetOsFamily, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'os_family_id' })
  osFamily: AssetOsFamily;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
