import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetMaintenanceRecord } from '../entities/asset-maintenance-record.entity';

@Injectable()
export class AssetMaintenanceRecordsService {
  constructor(
    @InjectRepository(AssetMaintenanceRecord)
    private readonly recordRepository: Repository<AssetMaintenanceRecord>,
  ) {}

  async getAll(filters: {
    siteId?: number;
    assetId?: number;
    planId?: number;
    from?: string;
    to?: string;
  }) {
    const { siteId, assetId, planId, from, to } = filters;

    const query = this.recordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.plan', 'plan')
      .leftJoinAndSelect('record.asset', 'asset')
      .leftJoinAndSelect('record.site', 'site')
      .leftJoinAndSelect('record.creator', 'creator');

    if (siteId) query.andWhere('record.siteId = :siteId', { siteId });
    if (assetId) query.andWhere('record.assetId = :assetId', { assetId });
    if (planId) query.andWhere('record.planId = :planId', { planId });
    if (from) query.andWhere('record.performedAt >= :from', { from });
    if (to) query.andWhere('record.performedAt <= :to', { to });

    return query.orderBy('record.performedAt', 'DESC').getMany();
  }

  async getById(id: number) {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: ['plan', 'asset', 'site', 'creator'],
    });

    if (!record) {
      throw new NotFoundException('Registro de mantenimiento no encontrado');
    }

    return record;
  }
}
