import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Site } from './site.entity';
import { Role } from './role.entity';

@Entity('user_site_roles')
export class UserSiteRole {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', transformer: { from: (value) => Number(value), to: (value) => String(value) } })
  userId: number;

  @PrimaryColumn({ name: 'site_id', type: 'bigint', transformer: { from: (value) => Number(value), to: (value) => String(value) } })
  siteId: number;

  @PrimaryColumn({ name: 'role_id', type: 'bigint', transformer: { from: (value) => Number(value), to: (value) => String(value) } })
  roleId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
