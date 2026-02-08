import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Holiday } from '../entities/holiday.entity';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidaysRepository: Repository<Holiday>,
  ) {}

  async getAll(params?: { isActive?: boolean }) {
    const where: Partial<Holiday> = {};
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return this.holidaysRepository.find({
      where,
      relations: ['creator', 'updater'],
      order: { date: 'ASC', name: 'ASC' },
    });
  }

  async getById(id: number) {
    const holiday = await this.holidaysRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!holiday) {
      throw new NotFoundException('Festivo no encontrado');
    }

    return holiday;
  }

  async create(data: CreateHolidayDto, userId: number) {
    const holiday = this.holidaysRepository.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });

    try {
      const saved = await this.holidaysRepository.save(holiday);
      return await this.getById(saved.id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un festivo con esa fecha y nombre');
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateHolidayDto, userId: number) {
    try {
      await this.holidaysRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un festivo con esa fecha y nombre');
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const holidays = await this.holidaysRepository.find({
      order: { date: 'ASC', name: 'ASC' },
    });

    const data = holidays.map((holiday) => ({
      'Fecha (YYYY-MM-DD)': holiday.date,
      Nombre: holiday.name,
      Descripcion: holiday.description || '',
      Activo: holiday.isActive ? 'Si' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Festivos');

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 30 },
      { wch: 50 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const examples = [
      {
        'Fecha (YYYY-MM-DD)': '2026-01-01',
        Nombre: "Dia d'Any Nou",
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-01-06',
        Nombre: 'Epifania',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-04-03',
        Nombre: 'Bon divendres',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-04-06',
        Nombre: 'Dilluns de Pasqua',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-05-01',
        Nombre: 'Dia laborable',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-06-24',
        Nombre: 'Dia de Sant Joan Baptista',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-08-05',
        Nombre: 'Fiesta mayor',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-08-15',
        Nombre: 'Assumpcio de Maria',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-09-11',
        Nombre: 'Dia de Catalunya',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-10-12',
        Nombre: 'Dia del patrimoni hispanic',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-11-01',
        Nombre: 'Dia de Tots Sants',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-12-06',
        Nombre: 'Dia de la Constitucio',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-12-08',
        Nombre: 'Festa de la Immaculada Concepcio',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-12-25',
        Nombre: 'Dia del Nadal',
        Descripcion: '',
        Activo: 'Si',
      },
      {
        'Fecha (YYYY-MM-DD)': '2026-12-26',
        Nombre: 'Dia de Sant Esteve',
        Descripcion: '',
        Activo: 'Si',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Festivos');

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 30 },
      { wch: 50 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer, userId: number): Promise<{ insertados: number; duplicados: any[]; errores: string[] }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const errores: string[] = [];
    const duplicados: any[] = [];
    let insertados = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row['Fecha (YYYY-MM-DD)'] || !row['Nombre']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (Fecha, Nombre)`);
          continue;
        }

        const date = String(row['Fecha (YYYY-MM-DD)']).trim();
        const name = String(row['Nombre']).trim();
        const description = row['Descripcion'] ? String(row['Descripcion']).trim() : '';
        const isActiveStr = String(row['Activo'] || 'Si').trim().toLowerCase();
        const isActive = isActiveStr === 'si' || isActiveStr === 'sí' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.holidaysRepository.findOne({
          where: { date, name },
        });

        if (existing) {
          duplicados.push({
            fila: rowNum,
            fecha: date,
            nombre: name,
            idExistente: existing.id,
            datos: {
              date,
              name,
              description,
              isActive,
            },
          });
        } else {
          const newHoliday = this.holidaysRepository.create({
            date,
            name,
            description,
            isActive,
            createdBy: userId,
            updatedBy: userId,
          });
          await this.holidaysRepository.save(newHoliday);
          insertados++;
        }
      } catch (error: any) {
        errores.push(`Fila ${rowNum}: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }

  async updateDuplicatesFromExcel(duplicates: any[], userId: number): Promise<{ actualizados: number; errores: string[] }> {
    const errores: string[] = [];
    let actualizados = 0;

    for (const dup of duplicates) {
      try {
        await this.holidaysRepository.update(dup.idExistente, {
          ...dup.datos,
          updatedBy: userId,
        });
        actualizados++;
      } catch (error: any) {
        errores.push(`Fila ${dup.fila}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
