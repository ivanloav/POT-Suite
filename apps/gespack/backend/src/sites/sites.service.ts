import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Site } from '../entities/site.entity';
import { Repository } from 'typeorm';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { UserSite } from 'src/entities/user-site.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(UserSite) private readonly userSiteRepo: Repository<UserSite>,
    @InjectRepository(Site) private readonly siteRepo: Repository<Site>,
  ) {}

  async findForUser(userId: number) {
    // Devuelve los sites asignados al usuario (puedes filtrar por is_active si quieres)
    const rows = await this.userSiteRepo
      .createQueryBuilder('us')
      .innerJoinAndSelect('us.site', 's')
      .where('us.userId = :userId', { userId })
      .orderBy('s.siteName', 'ASC') // ajusta al nombre real de tu columna
      .getMany();

    return rows.map(r => ({
      siteId: r.siteId,
      siteName: (r as any).site?.siteName ?? r.siteId,
    }));
  }

  async findAll(): Promise<Site[]> {
    return this.siteRepo.find({
      select: ['siteId', 'siteName'],
      where: { isActive: true },
      order: { siteName: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.siteRepo.findOne({
      where: { siteId: id },
    });
  }

  getCurrent(siteId: number) {
    return this.findOne(siteId);
  }

  update(id: number, dto: UpdateSiteDto) {
    return this.siteRepo.update(id, dto);
  }

  remove(id: number) {
    return this.siteRepo.delete(id);
  }

  create(dto: CreateSiteDto) {
    const site = this.siteRepo.create(dto);
    return this.siteRepo.save(site);
  }
}