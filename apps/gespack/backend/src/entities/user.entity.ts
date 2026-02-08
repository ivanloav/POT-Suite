import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'user_name', type: 'text' })
  userName: string;

  @Column({ name: 'user_password', type: 'text' })
  userPassword: string;

  @Column({ name: 'email', type: 'text', nullable: true })
  email: string;

  @Column({ name: 'locale', type: 'text', nullable: true, default: 'es' })
  locale: string;

  @Column({ name: 'is_customer', type: 'boolean', default: false })
  isCustomer: boolean;

  @Column({ name: 'is_admin', type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_cb', type: 'boolean', default: false })
  isCB: boolean;

  @Column({ name: 'is_list', type: 'boolean', default: false })
  isList: boolean;

  @Column({ name: 'total_site', type: 'bigint', nullable: true })
  totalSite: number;

  @Column({ name: 'send_daily_orders_report', type: 'bigint', nullable: false })
  sendDailyOrdersReport: number;

  @Column({ name: 'created_by', type: 'bigint', nullable: true })
  createdBy: number;

  @Column({ name: 'created_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true })
  modifiedBy: number;

  @Column({ name: 'updated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt: Date;
}