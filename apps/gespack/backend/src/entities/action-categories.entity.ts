import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ActionCategoryCost } from './action-category-costs.entity';

@Entity('action_categories')
@Unique(['siteId', 'categoryName'])
@Unique(['siteId', 'actionCategoryId'])
export class ActionCategory {
  @PrimaryGeneratedColumn({ name: 'action_category_id', type: 'bigint' })
  actionCategoryId: string;

  @Column({ name: 'site_id', type: 'bigint' })
  siteId: string;

  @Column({ name: 'category_name', type: 'text' })
  categoryName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => ActionCategoryCost, (cost) => cost.actionCategory)
  actionCategoryCosts: ActionCategoryCost[];
}
