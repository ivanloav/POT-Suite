import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { AssetMaintenanceType } from '../entities/asset-maintenance-type.entity';
import { CreateAssetMaintenanceTypeDto, UpdateAssetMaintenanceTypeDto } from './dto/asset-maintenance-type.dto';

@Injectable()
export class AssetMaintenanceTypesService {
  constructor(
    @InjectRepository(AssetMaintenanceType)
    private readonly maintenanceTypeRepository: Repository<AssetMaintenanceType>,
  ) {}

  async getAll(params?: { isActive?: boolean }) {
    const where: Partial<AssetMaintenanceType> = {};
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return await this.maintenanceTypeRepository.find({
      where,
      relations: ['creator', 'updater'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(data: CreateAssetMaintenanceTypeDto, userId: number) {
    const type = this.maintenanceTypeRepository.create({
      ...data,
      createdBy: userId,
    });

    try {
      const saved = await this.maintenanceTypeRepository.save(type);
      return await this.maintenanceTypeRepository.findOne({
        where: { id: saved.id },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de mantenimiento con el codigo "${data.code}"`);
      }
      throw error;
    }
  }

  async getById(id: number) {
    return await this.maintenanceTypeRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  async update(id: number, data: UpdateAssetMaintenanceTypeDto, userId: number) {
    try {
      await this.maintenanceTypeRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de mantenimiento con el codigo "${data.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const types = await this.maintenanceTypeRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const data = types.map((t) => ({
      Code: t.code,
      Name: t.name,
      Description: t.description || '',
      'Sort Order': t.sortOrder,
      'Is Active': t.isActive ? 'Si' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Types');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 50 },
      { wch: 12 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const examples = [
      {
        Code: 'printer_cleaning',
        Name: 'Limpieza impresora',
        Description: 'Limpieza general y cabezales',
        'Sort Order': 10,
        'Is Active': 'Si',
      },
      {
        Code: 'printer_check',
        Name: 'Revision impresora',
        Description: 'Revision de componentes y rodillos',
        'Sort Order': 20,
        'Is Active': 'Si',
      },
      {
        Code: 'update',
        Name: 'Actualizacion',
        Description: 'Actualizacion de firmware o software',
        'Sort Order': 30,
        'Is Active': 'Si',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Types');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 50 },
      { wch: 12 },
      { wch: 10 },
    ];

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
      const rowNum = i + 2;

      try {
        if (!row['Code'] || !row['Name']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (Code, Name)`);
          continue;
        }

        const code = String(row['Code']).trim();
        const name = String(row['Name']).trim();
        const description = row['Description'] ? String(row['Description']).trim() : '';
        const sortOrder = row['Sort Order'] ? parseInt(row['Sort Order']) : 0;
        const isActiveStr = String(row['Is Active'] || 'Si').trim().toLowerCase();
        const isActive = isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.maintenanceTypeRepository.findOne({
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
              description,
              sortOrder,
              isActive,
            },
          });
        } else {
          const newType = this.maintenanceTypeRepository.create({
            code,
            name,
            description,
            sortOrder,
            isActive,
          });
          await this.maintenanceTypeRepository.save(newType);
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
        await this.maintenanceTypeRepository.update(dup.idExistente, dup.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Fila ${dup.fila}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
