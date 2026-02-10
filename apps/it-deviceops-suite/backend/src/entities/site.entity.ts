import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('increment', { name: 'site_id',type: 'bigint' })
  siteId: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  // Relaciones inversas (opcional)
  @OneToMany('Asset', 'site')
  assets: any[];

  @OneToMany('Employee', 'site')
  employees: any[];

  @OneToMany('Section', 'site')
  sections: any[];

  @OneToMany('AssetAssignment', 'site')
  assignments: any[];

  @OneToMany('UserSite', 'site')
  userSites: any[];

  @OneToMany('UserSiteRole', 'site')
  userSiteRoles: any[];
}
