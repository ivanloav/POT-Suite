import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('order_payments_card_types')
export class OrderPaymentsCardType {
  @PrimaryGeneratedColumn({ name: 'card_type_id', type: 'bigint' })
  cardTypeId: number;

  @Column({ name: 'card_type_name', type: 'text', unique: true })
  cardTypeName: string;

  @Column({ name: 'created_by', type: 'text', nullable: true })
  createdBy?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'text', nullable: true })
  updatedBy?: string;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}