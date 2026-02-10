import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryColumn({ type: 'varchar', length: 45 })
  ip: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ type: 'timestamptz', name: 'last_attempt' })
  lastAttempt: Date;

  @Column({ type: 'timestamptz', name: 'blocked_until', nullable: true })
  blockedUntil: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
