import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AssetType } from './asset-type.entity';
import { Section } from './section.entity';
import { AssetModel } from './asset-model.entity';
import { AssetOsVersion } from './asset-os-version.entity';
import { User } from './user.entity';
import { Site } from './site.entity';
import { Employee } from './employee.entity';
import { AssetCpu } from './asset-cpu.entity';
import { AssetRamOption } from './asset-ram-option.entity';
import { StorageOption } from './storage-option.entity';
import { AssetStatus } from './asset-status.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column({ name: 'asset_tag' })
  assetTag: string;

  @Column({ name: 'employee_id', type: 'bigint', nullable: true })
  employeeId: number;

  @Column({ name: 'type_id', type: 'bigint' })
  typeId: number;

  @Column({ name: 'section_id', type: 'bigint', nullable: true })
  sectionId: number;

  @Column({ name: 'model_id', type: 'bigint', nullable: true })
  modelId: number;

  @Column({ name: 'os_version_id', type: 'bigint', nullable: true })
  osVersionId: number;

  @Column({ name: 'cpu_id', type: 'bigint', nullable: true })
  cpuId: number;

  @Column({ name: 'ram_id', type: 'bigint', nullable: true })
  ramId: number;

  @Column({ name: 'storage_id', type: 'bigint', nullable: true })
  storageId: number;

  @Column({ nullable: true, unique: true })
  serial: string;

  @Column({ nullable: true, unique: true })
  imei: string;

  @Column({ name: 'mac_address', nullable: true })
  macAddress: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  uuid: string;

  @Column({ name: 'status_id', type: 'bigint', nullable: true })
  statusId: number;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ name: 'warranty_end', type: 'date', nullable: true })
  warrantyEnd: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'retired_at', type: 'timestamptz', nullable: true })
  retiredAt: Date;

  @Column({ name: 'retired_reason', type: 'text', nullable: true })
  retiredReason: string;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Site, site => site.assets)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => AssetType, type => type.assets)
  @JoinColumn({ name: 'type_id' })
  type: AssetType;

  @ManyToOne(() => Section, section => section.assets, { nullable: true })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @ManyToOne(() => AssetModel, model => model.assets, { nullable: true })
  @JoinColumn({ name: 'model_id' })
  model: AssetModel;

  @ManyToOne(() => AssetOsVersion, version => version.assets, { nullable: true })
  @JoinColumn({ name: 'os_version_id' })
  osVersion: AssetOsVersion;

  @ManyToOne(() => AssetCpu, cpu => cpu.assets, { nullable: true })
  @JoinColumn({ name: 'cpu_id' })
  cpu: AssetCpu;

  @ManyToOne(() => AssetRamOption, ram => ram.assets, { nullable: true })
  @JoinColumn({ name: 'ram_id' })
  ram: AssetRamOption;

  @ManyToOne(() => StorageOption, storage => storage.assets, { nullable: true })
  @JoinColumn({ name: 'storage_id' })
  storage: StorageOption;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => AssetStatus, { nullable: true })
  @JoinColumn({ name: 'status_id' })
  status: AssetStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToMany('AssetAssignment', 'asset')
  assignments: any[];
}
