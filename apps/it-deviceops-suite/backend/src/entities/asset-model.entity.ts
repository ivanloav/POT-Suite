import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AssetType } from './asset-type.entity';
import { AssetBrand } from './asset-brand.entity';
import { User } from './user.entity';

@Entity('asset_models')
export class AssetModel {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'type_id', type: 'bigint' })
  typeId: number;

  @Column({ name: 'brand_id', type: 'bigint' })
  brandId: number;

  @Column()
  model: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AssetType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'type_id' })
  type: AssetType;

  @ManyToOne(() => AssetBrand, brand => brand.models, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brand_id' })
  brand: AssetBrand;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToMany('Asset', 'model')
  assets: any[];
}
