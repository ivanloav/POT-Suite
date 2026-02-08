import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ActionCategoryCost } from './action-category-costs.entity';

@Entity('action_priority_types')
@Unique(['siteId', 'priorityName'])
@Unique(['siteId', 'actionPriorityId'])
export class ActionPriorityType {
  @PrimaryGeneratedColumn({ name: 'action_priority_id', type: 'bigint' })
  actionPriorityId: string;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: string;

  @Column({ name: 'priority_name', type: 'text' })
  priorityName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => ActionCategoryCost, (cost) => cost.actionPriorityType)
  actionCategoryCosts: ActionCategoryCost[];
}
