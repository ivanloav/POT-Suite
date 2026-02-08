import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetStatus } from '../entities/asset-status.entity';
import { CreateAssetStatusDto, UpdateAssetStatusDto } from './dto/asset-status.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetStatusesService {
  constructor(
    @InjectRepository(AssetStatus)
    private readonly assetStatusRepository: Repository<AssetStatus>,
  ) {}

  async getAll() {
    return await this.assetStatusRepository.find({
      relations: ['creator', 'updater'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(data: CreateAssetStatusDto, userId: number) {
    const status = this.assetStatusRepository.create({
      ...data,
      createdBy: userId,
    });
    
    try {
      const saved = await this.assetStatusRepository.save(status);
      return await this.assetStatusRepository.findOne({
        where: { id: saved.id },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un estado con el código "${data.code}"`);
      }
      throw error;
    }
  }

  async getById(id: number) {
    return await this.assetStatusRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  async update(id: number, data: UpdateAssetStatusDto, userId: number) {
    try {
      await this.assetStatusRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un estado con el código "${data.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const statuses = await this.assetStatusRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const data = statuses.map(s => ({
      'Code': s.code,
      'Name': s.name,
      'Color Class': s.colorClass || '',
      'Sort Order': s.sortOrder,
      'Is Active': s.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Statuses');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 60 },
      { wch: 12 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const examples = [
      { 'Code': 'in_stock', 'Name': 'En Stock', 'Color Class': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 'Sort Order': 10, 'Is Active': 'Sí' },
      { 'Code': 'assigned', 'Name': 'Asignado', 'Color Class': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 'Sort Order': 20, 'Is Active': 'Sí' },
      { 'Code': 'repair', 'Name': 'En Reparación', 'Color Class': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 'Sort Order': 30, 'Is Active': 'Sí' },
      { 'Code': 'retired', 'Name': 'Retirado', 'Color Class': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 'Sort Order': 40, 'Is Active': 'Sí' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Statuses');

    worksheet['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 60 }, { wch: 12 }, { wch: 10 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer): Promise<{ insertados: number; duplicados: any[]; errores: string[] }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const errores: string[] = [];
    const duplicados: any[] = [];
    let insertados = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header

      try {
        if (!row['Code'] || !row['Name']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (Code, Name)`);
          continue;
        }

        const code = String(row['Code']).trim();
        const name = String(row['Name']).trim();
        const colorClass = row['Color Class'] ? String(row['Color Class']).trim() : '';
        const sortOrder = row['Sort Order'] ? parseInt(row['Sort Order']) : 0;
        const isActiveStr = String(row['Is Active'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.assetStatusRepository.findOne({
          where: { code },
        });

        if (existing) {
          duplicados.push({
            fila: rowNum,
            codigo: code,
            nombre: name,
            idExistente: existing.id,
            datos: {
              code,
              name,
              colorClass,
              sortOrder,
              isActive,
            }
          });
        } else {
          const newStatus = this.assetStatusRepository.create({
            code,
            name,
            colorClass,
            sortOrder,
            isActive,
          });
          await this.assetStatusRepository.save(newStatus);
          insertados++;
        }
      } catch (error: any) {
        errores.push(`Fila ${rowNum}: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }

  async updateDuplicatesFromExcel(duplicates: any[]): Promise<{ actualizados: number; errores: string[] }> {
    const errores: string[] = [];
    let actualizados = 0;

    for (const dup of duplicates) {
      try {
        await this.assetStatusRepository.update(dup.idExistente, dup.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Fila ${dup.fila}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
