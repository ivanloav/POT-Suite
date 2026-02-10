import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Site } from './site.entity';

@Entity('user_sites')
export class UserSite {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', transformer: { from: (value) => Number(value), to: (value) => String(value) } })
  userId: number;

  @PrimaryColumn({ name: 'site_id', type: 'bigint', transformer: { from: (value) => Number(value), to: (value) => String(value) } })
  siteId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;
}
