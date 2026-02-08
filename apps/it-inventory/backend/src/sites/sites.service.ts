import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from '../entities/site.entity';
import { UserSite } from '../entities/user-site.entity';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';
import * as xlsx from 'xlsx';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(UserSite)
    private readonly userSiteRepository: Repository<UserSite>,
  ) {}

  async findAll() {
    return await this.siteRepository.find({
      where: { isActive: true },
      relations: ['creator', 'updater'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    return await this.siteRepository.findOne({
      where: { siteId: id },
      relations: ['creator', 'updater'],
    });
  }

  async findUserSites(userId: number) {
    const userSites = await this.userSiteRepository.find({
      where: { userId, isActive: true },
      relations: ['site'],
    });

    return userSites
      .filter(us => us.site?.isActive)
      .map(us => us.site);
  }

  async create(dto: CreateSiteDto, userId: number) {
    const exists = await this.siteRepository.findOne({ where: { code: dto.code } });
    if (exists) {
      throw new BadRequestException(`Ya existe un site con el código ${dto.code}`);
    }

    const site = this.siteRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });
    
    try {
      const saved = await this.siteRepository.save(site);
      return await this.siteRepository.findOne({
        where: { siteId: saved.siteId },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un site con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateSiteDto, userId: number) {
    const site = await this.siteRepository.findOne({ where: { siteId: id } });
    if (!site) {
      throw new NotFoundException(`Site con ID ${id} no encontrado`);
    }

    if (dto.code && dto.code !== site.code) {
      const exists = await this.siteRepository.findOne({ where: { code: dto.code } });
      if (exists) {
        throw new BadRequestException(`Ya existe un site con el código ${dto.code}`);
      }
    }

    Object.assign(site, { ...dto, updatedBy: userId });
    
    try {
      await this.siteRepository.save(site);
      return await this.siteRepository.findOne({
        where: { siteId: id },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un site con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel() {
    const sites = await this.siteRepository.find({
      relations: ['creator', 'updater'],
      order: { name: 'ASC' },
    });

    const data = sites.map(site => ({
      ID: site.siteId,
      'Código': site.code,
      'Nombre': site.name,
      'Estado': site.isActive ? 'Activo' : 'Inactivo',
      'Creado por': site.creator?.userName || 'N/A',
      'Fecha creación': site.createdAt ? new Date(site.createdAt).toLocaleString('es-ES') : 'N/A',
      'Modificado por': site.updater?.userName || 'N/A',
      'Fecha modificación': site.updatedAt ? new Date(site.updatedAt).toLocaleString('es-ES') : 'N/A',
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sites');
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate() {
    const templateData = [
      { 'Código': 'MAD', 'Nombre': 'Madrid Centro', 'Estado': 'Activo' },
      { 'Código': 'BCN', 'Nombre': 'Barcelona', 'Estado': 'Activo' },
    ];

    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sites');
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer, userId: number) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(worksheet);

    let insertados = 0;
    let duplicados = 0;
    const errores: string[] = [];

    for (const row of rows) {
      try {
        const code = row['Código']?.toString().trim();
        const name = row['Nombre']?.toString().trim();
        const estado = row['Estado']?.toString().trim();

        if (!code || !name) {
          errores.push(`Fila omitida: falta código o nombre`);
          continue;
        }

        const exists = await this.siteRepository.findOne({ where: { code } });
        if (exists) {
          duplicados++;
          continue;
        }

        const site = this.siteRepository.create({
          code,
          name,
          isActive: estado?.toLowerCase() === 'activo',
          createdBy: userId,
          updatedBy: userId,
        });
        await this.siteRepository.save(site);
        insertados++;
      } catch (error: any) {
        errores.push(`Error procesando fila: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }
}
