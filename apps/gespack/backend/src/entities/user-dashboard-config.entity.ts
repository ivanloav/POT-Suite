// backend/src/entities/user-dashboard-config.entity.ts - ARCHIVO COMPLETO CORREGIDO
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('user_dashboard_config')
@Unique(['userId', 'siteId'])
export class UserDashboardConfig {
  @PrimaryGeneratedColumn({ 
    name: 'user_dashboard_config_id',
    type: 'bigint'
  })
  userDashboardConfigId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ 
    name: 'site_id',
    comment: '0 = configuración global para todos los sitios'
  })
  siteId: number;

  @Column({ 
    name: 'card_order',
    type: 'json'
  })
  cardOrder: string[];

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  modifiedAt: Date;

  // 👈 SOLO relación con User (sin FK constraint en BD)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 👈 SIN RELACIÓN A SITE - para permitir site_id = 0
}