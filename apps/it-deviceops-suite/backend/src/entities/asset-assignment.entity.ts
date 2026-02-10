import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';
import { Employee } from './employee.entity';
import { User } from './user.entity';
import { Site } from './site.entity';

@Entity('asset_assignments')
export class AssetAssignment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column({ name: 'asset_id', type: 'bigint' })
  assetId: number;

  @Column({ name: 'employee_id', type: 'bigint' })
  employeeId: number;

  @Column({ name: 'assigned_at', type: 'timestamptz', default: () => 'now()' })
  assignedAt: Date;

  @Column({ name: 'returned_at', type: 'timestamptz', nullable: true })
  returnedAt: Date;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Site, site => site.assignments)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;

  @ManyToOne(() => Asset, asset => asset.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @ManyToOne(() => Employee, employee => employee.assignments)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
