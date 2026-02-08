import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from './site.entity';
import { Order } from './orders.entity';
import { Product } from './product.entity';

@Entity({ name: 'order_notes' })
export class OrderNotes {
  @PrimaryGeneratedColumn('increment', { name: 'note_id' })
  noteId!: number;

  @Column('bigint', { name: 'site_id' })
  siteId!: number;

  @Column('bigint', { name: 'order_id' })
  orderId!: number;

  @Column('text', { name: 'order_reference' })
  orderReference: string;

  @Column('text', { name: 'note_text' })
  noteText: string;

  @Column('boolean', { name: 'is_internal', default: false })
  isInternal: boolean;

  @Column('text', { name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column('text', { name: 'updated_by', nullable: true })
  updatedBy?: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site?: Site;

  @ManyToOne(() => Order)
  @JoinColumn([
    { name: 'site_id', referencedColumnName: 'siteId' },
    { name: 'order_id', referencedColumnName: 'orderId' }
  ])
  order?: Order;
}
