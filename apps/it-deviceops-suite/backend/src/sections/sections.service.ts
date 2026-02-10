import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../entities/section.entity';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async getAll(siteId?: number) {
    const where = siteId ? { siteId } : {};
    return await this.sectionRepository.find({
      where,
      relations: ['site', 'creator', 'updater'],
      order: { siteId: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(data: CreateSectionDto, userId: number) {
    const section = this.sectionRepository.create({
      ...data,
      createdBy: userId,
    });
    
    try {
      const saved = await this.sectionRepository.save(section);
      return await this.sectionRepository.findOne({
        where: { id: saved.id },
        relations: ['site', 'creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_sections_site_name')) {
          throw new ConflictException(`Ya existe una sección con el nombre "${data.name}" en este sitio`);
        }
        throw new ConflictException('Ya existe una sección con esos datos en este sitio');
      }
      throw error;
    }
  }

  async getById(id: number) {
    return await this.sectionRepository.findOne({
      where: { id },
      relations: ['site', 'creator', 'updater'],
    });
  }

  async getNextSortOrder(siteId: number): Promise<number> {
    const maxSection = await this.sectionRepository
      .createQueryBuilder('section')
      .select('MAX(section.sortOrder)', 'maxOrder')
      .where('section.siteId = :siteId', { siteId })
      .getRawOne();
    
    return (maxSection?.maxOrder || 0) + 10;
  }

  async update(id: number, data: UpdateSectionDto, userId: number) {
    try {
      await this.sectionRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_sections_site_name')) {
          throw new ConflictException(`Ya existe una sección con el nombre "${data.name}" en este sitio`);
        }
        throw new ConflictException('Ya existe una sección con esos datos en este sitio');
      }
      throw error;
    }
  }

  async exportToExcel(siteId?: number): Promise<Buffer> {
    const sections = await this.sectionRepository.find({
      where: siteId ? { siteId } : {},
      relations: ['site'],
      order: { siteId: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });

    const data = sections.map(s => ({
      'Site': s.site?.name || '',
      'Name': s.name,
      'Sort Order': s.sortOrder,
      'Is Active': s.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sections');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const templateData = [
      {
        'Site ID': 1,
        'Name': 'Ejemplo Sección',
        'Sort Order': 0,
        'Is Active': 'Sí',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sections');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer, userId: number) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    const insertados = [];
    const duplicados = [];
    const errores = [];

    for (let i = 0; i < rows.length; i++) {
      const row: any = rows[i];
      const fila = i + 2;

      try {
        const siteId = parseInt(String(row['Site ID'] || ''));
        const name = String(row['Name'] || '').trim();
        const sortOrder = parseInt(String(row['Sort Order'] || '0'));
        const isActive = String(row['Is Active'] || 'Sí').toLowerCase() === 'sí';

        if (!siteId || !name) {
          errores.push(`Fila ${fila}: Site ID y Name son requeridos`);
          continue;
        }

        // Verificar duplicado
        const existing = await this.sectionRepository.findOne({
          where: { siteId, name },
        });

        if (existing) {
          duplicados.push({
            fila,
            siteId,
            nombre: name,
            ordenClasificacion: sortOrder,
            activo: isActive,
            idExistente: existing.id,
          });
          continue;
        }

        // Crear nueva sección
        const section = this.sectionRepository.create({
          siteId,
          name,
          sortOrder,
          isActive,
          createdBy: userId,
        });

        await this.sectionRepository.save(section);
        insertados.push(section);
      } catch (error: any) {
        errores.push(`Fila ${fila}: ${error.message}`);
      }
    }

    return {
      insertados: insertados.length,
      duplicados,
      errores,
    };
  }

  async updateDuplicatesFromExcel(duplicates: any[]) {
    const actualizados = [];
    const errores = [];

    for (const dup of duplicates) {
      try {
        await this.sectionRepository.update(dup.idExistente, {
          name: dup.nombre,
          sortOrder: dup.ordenClasificacion,
          isActive: dup.activo,
        });
        actualizados.push(dup.idExistente);
      } catch (error: any) {
        errores.push(`ID ${dup.idExistente}: ${error.message}`);
      }
    }

    return {
      actualizados: actualizados.length,
      errores,
    };
  }
}
