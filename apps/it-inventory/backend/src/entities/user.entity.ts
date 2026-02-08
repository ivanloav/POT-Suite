import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseInt(value, 10),
};

@Entity('app_users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'user_name', type: 'text', nullable: true })
  userName: string;

  @Column({ type: 'citext', unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 10, default: 'es' })
  language: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'bigint', nullable: true, transformer: bigintTransformer })
  createdBy: number;

  @Column({ name: 'updated_by', type: 'bigint', nullable: true, transformer: bigintTransformer })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @OneToMany('UserRole', 'user')
  userRoles: any[];

  @OneToMany('UserSite', 'user')
  userSites: any[];

  @OneToMany('UserSiteRole', 'user')
  userSiteRoles: any[];
}
