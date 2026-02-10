import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { AssetBrand } from './asset-brand.entity';
import { CpuVendor } from './asset-cpu-vendor.entity';
import { User } from './user.entity';

@Entity('asset_brand_cpu_compatibility')
export class AssetBrandCpuCompatibility {
  @PrimaryColumn({ name: 'brand_id', type: 'bigint' })
  brandId: number;

  @PrimaryColumn({ name: 'cpu_vendor_id', type: 'bigint' })
  cpuVendorId: number;

  @ManyToOne(() => AssetBrand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: AssetBrand;

  @ManyToOne(() => CpuVendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cpu_vendor_id' })
  cpuVendor: CpuVendor;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
