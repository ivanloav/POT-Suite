// backend/src/dashboard/dashboard-config.service.ts - MÁS LOGS
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDashboardConfig } from '../entities/user-dashboard-config.entity';

@Injectable()
export class DashboardConfigService {
  constructor(
    @InjectRepository(UserDashboardConfig)
    private configRepository: Repository<UserDashboardConfig>,
  ) {}

  async getConfig(userId: number, siteId: number): Promise<string[] | null> {
    const config = await this.configRepository.findOne({
      where: { userId, siteId }
    });
    
    return config ? config.cardOrder : null;
  }

  async saveConfig(userId: number, siteId: number, cardOrder: string[]): Promise<UserDashboardConfig> {
    // 👈 VALIDAR entrada
    if (!Array.isArray(cardOrder)) {
      console.error('❌ cardOrder no es array:', cardOrder);
      throw new Error('cardOrder debe ser un array');
    }

    const validCardOrder = cardOrder.filter(item => 
      typeof item === 'string' && 
      item.length > 0 && 
      item.trim() !== ''
    );
    
    if (validCardOrder.length === 0) {
      console.error('❌ No hay elementos válidos en cardOrder:', cardOrder);
      throw new Error('cardOrder debe contener al menos un elemento válido');
    }

    const existingConfig = await this.configRepository.findOne({
      where: { userId, siteId }
    });

    let saved: UserDashboardConfig;

    if (existingConfig) {
      existingConfig.cardOrder = validCardOrder;
      existingConfig.modifiedAt = new Date();
      saved = await this.configRepository.save(existingConfig);
    } else {
      const newConfig = this.configRepository.create({
        userId,
        siteId,
        cardOrder: validCardOrder
      });
      saved = await this.configRepository.save(newConfig);
    }
    
    return saved;
  }

  async resetConfig(userId: number, siteId: number): Promise<void> {
    await this.configRepository.delete({ userId, siteId });
  }
}