import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AssetBrand } from './asset-brand.entity';
import { AssetRamMemoryType } from './asset-ram-memory-type.entity';
import { User } from './user.entity';

@Entity('asset_brand_ram_compatibility')
export class AssetBrandRamCompatibility {
  @PrimaryColumn({ name: 'brand_id', type: 'bigint' })
  brandId: number;

  @PrimaryColumn({ name: 'ram_type_id', type: 'bigint' })
  ramTypeId: number;

  @ManyToOne(() => AssetBrand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: AssetBrand;

  @ManyToOne(() => AssetRamMemoryType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ram_type_id' })
  ramType: AssetRamMemoryType;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
