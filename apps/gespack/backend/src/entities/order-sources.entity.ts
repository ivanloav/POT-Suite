import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Site } from './site.entity';

/**
 * order_sources (catálogo de orígenes de pedido)
 * - PK: order_source_id (identity)
 * - FK: site_id -> sites(site_id)
 * - UNIQUE funcional en SQL: (site_id, lower(source_name))  <-- se crea en el DDL
 * - UNIQUE compuesta sugerida: (site_id, order_source_id)  <-- para FKs compuestas
 */

@Entity('order_sources')
@Unique('uq_order_sources_site_id_and_id', ['siteId', 'orderSourceId'])
@Index('idx_order_sources_site_id', ['siteId'])
@Index('idx_order_sources_site_active', ['siteId', 'isActive'])
@Index('idx_order_sources_site_modified', ['siteId', 'modifiedAt'])
export class OrderSource {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'order_source_id' })
  orderSourceId!: number;

  @Column('bigint', { name: 'site_id' })
  siteId!: number;

  @Column({ type: 'text', name: 'source_name' })
  sourceName!: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column('bigint', { name: 'created_by', nullable: true })
  createdBy!: number | null;

  @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column('bigint', { name: 'updated_by', nullable: true })
  modifiedBy!: number | null;

  @Column({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  // ─────────────────────────── Relations ───────────────────────────

  @ManyToOne(() => Site)
  @JoinColumn([{ name: 'site_id', referencedColumnName: 'siteId' }])
  site!: Site;
}