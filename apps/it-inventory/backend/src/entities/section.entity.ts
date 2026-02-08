import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Site } from './site.entity';
import { User } from './user.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column()
  name: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Site, site => site.sections)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;

  @OneToMany('Asset', 'section')
  assets: any[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
