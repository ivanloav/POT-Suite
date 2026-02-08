import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AssetBrand } from './asset-brand.entity';
import { AssetOsFamily } from './asset-os-family.entity';
import { User } from './user.entity';

@Entity('asset_brand_os_compatibility')
export class AssetBrandOsCompatibility {
  @PrimaryColumn({ name: 'brand_id', type: 'bigint' })
  brandId: number;

  @PrimaryColumn({ name: 'os_family_id', type: 'bigint' })
  osFamilyId: number;

  @ManyToOne(() => AssetBrand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: AssetBrand;

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
