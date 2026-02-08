import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ActionCategory } from './action-categories.entity';
import { ActionPriorityType } from './action-priority-types.entity';

@Entity('action_category_costs')
@Unique(['siteId', 'categoryCostName'])
export class ActionCategoryCost {
  @PrimaryGeneratedColumn({ name: 'category_cost_id', type: 'bigint' })
  categoryCostId: string;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: string;

  @Column({ name: 'category_cost_name', type: 'text' })
  categoryCostName: string;

  @Column({ name: 'action_category_id', type: 'int' })
  actionCategoryId: number;

  @Column({ name: 'action_priority_id', type: 'int' })
  actionPriorityId: number;

  @Column({ name: 'shipping_cost', type: 'numeric', precision: 19, scale: 4 })
  shippingCost: string;

  @Column({ name: 'mandatory_fee', type: 'numeric', precision: 19, scale: 4, default: 0 })
  mandatoryFee: string;

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => ActionCategory, (cat) => cat.actionCategoryCosts, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'action_category_id', referencedColumnName: 'actionCategoryId' },
  ])
  actionCategory: ActionCategory;

  @ManyToOne(() => ActionPriorityType, (priority) => priority.actionCategoryCosts, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'action_priority_id', referencedColumnName: 'actionPriorityId' },
  ])
  actionPriorityType: ActionPriorityType;
}
