import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from './user.entity';
import { Site } from './site.entity';

@Entity("user_site")
export class UserSite {
  @PrimaryGeneratedColumn({ name: 'user_site_id', type: "bigint" })
  userSiteId: number;

  @Column({ name: 'user_id', type: "bigint" })
  userId: number;

  @Column({ name: 'site_id', type: "bigint" })
  siteId: number;
 
  @Column({ name: 'created_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: User;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'siteId' })
  site: Site;
}
