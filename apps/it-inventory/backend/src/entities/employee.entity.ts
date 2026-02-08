import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Site } from './site.entity';
import { User } from './user.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'second_last_name', nullable: true })
  secondLastName: string;

  @Column({ type: 'citext', unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Site, site => site.employees)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site?: Site;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToMany('AssetAssignment', 'employee')
  assignments: any[];
}
