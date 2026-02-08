import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/orders.entity';
import { UserSite } from '../entities/user-site.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(UserSite)
    private readonly userSites: Repository<UserSite>,
  ) {}

  async getKpis(siteId: number | null | 0, userId: number) {
    try {
      let allowedSiteIds: number[] | null = null;
      
      if (!siteId || siteId === 0) {
        const rows = await this.userSites.find({ where: { userId } });
        allowedSiteIds = rows.map(r => r.siteId);
        
        if (allowedSiteIds.length === 0) {
          return this.getEmptyKpis();
        }
      }

      // ── BASE de pedidos no anulados ─────────────────────────────────────────
      const base = this.orders
        .createQueryBuilder('o')
        .where('COALESCE(o.is_annulled, false) = false');

      if (siteId && siteId > 0) {
        base.andWhere('o.site_id = :siteId', { siteId });
      } else if (allowedSiteIds) {
        base.andWhere('o.site_id IN (:...siteIds)', { siteIds: allowedSiteIds });
      }

      // KPIs de pedidos
      const ordersPendingInvoicing = await base
        .clone()
        .andWhere('COALESCE(o.is_paid, false) = true')
        .andWhere('COALESCE(o.is_invoiced, false) = false')
        .getCount();

      const ordersRecorded = await base.clone().getCount();

      const ordersPendingPayment = await base
        .clone()
        .andWhere('COALESCE(o.is_paid, false) = false')
        .getCount();

      const ordersInvoiced = await base
        .clone()
        .andWhere('COALESCE(o.is_invoiced, false) = true')
        .getCount();

      // KPIs de productos
      const qbPendingProducts = this.orders.manager
        .createQueryBuilder()
        .from('orders', 'o')
        .innerJoin('order_items', 'oi', 'oi.order_id = o.order_id')
        .where('COALESCE(o.is_annulled, false) = false')
        .andWhere('COALESCE(o.is_paid, false) = true')
        .andWhere('COALESCE(o.is_invoiced, false) = false');

      if (siteId && siteId > 0) {
        qbPendingProducts.andWhere('o.site_id = :siteId', { siteId });
      } else if (allowedSiteIds) {
        qbPendingProducts.andWhere('o.site_id IN (:...siteIds)', { siteIds: allowedSiteIds });
      }

      const rawPendingProducts = await qbPendingProducts
        .select('COALESCE(SUM(oi.quantity),0)','cnt')
        .getRawOne<{ cnt: string }>();

      const productsPendingInvoicing = Number(rawPendingProducts?.cnt ?? 0);

      const qbOutOfStock = base
        .clone()
        .andWhere('COALESCE(o.is_paid, false) = true')
        .andWhere('COALESCE(o.is_invoiced, false) = false')
        .innerJoin(
          'order_items',
          'oi',
          'oi.order_id = o.order_id AND oi.site_id = o.site_id'
        )
        .innerJoin(
          'products',
          'p',
          'p.product_id = oi.product_id AND p.site_id = o.site_id'
        )
        .andWhere('COALESCE(p.stock, 0) <= 0');

      const rawOutOfStock = await qbOutOfStock
        .select('COUNT(DISTINCT p.product_id)', 'cnt')
        .getRawOne<{ cnt: string }>();
      const productsOutOfStock = Number(rawOutOfStock?.cnt ?? 0);

      return {
        ordersPendingInvoicing,
        productsPendingInvoicing,
        productsOutOfStock,
        ordersRecorded,
        ordersPendingPayment,
        ordersInvoiced,
      };
    } catch (e) {
      console.error('[DashboardService.getKpis] error:', e);
      throw new InternalServerErrorException('Error calculando KPIs');
    }
  }

  /**
   * Retorna KPIs vacíos cuando no hay datos
   */
  private getEmptyKpis() {
    return {
      ordersPendingInvoicing: 0,
      productsPendingInvoicing: 0,
      productsOutOfStock: 0,
      ordersRecorded: 0,
      ordersPendingPayment: 0,
      ordersInvoiced: 0,
    };
  }
}