import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetType } from '../entities/asset-type.entity';
import { CreateAssetTypeDto, UpdateAssetTypeDto } from './dto/asset-type.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetTypesService {
  constructor(
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,
  ) {}

  async getAll() {
    return await this.assetTypeRepository.find({
      relations: ['creator', 'updater'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(data: CreateAssetTypeDto, userId: number) {
    const type = this.assetTypeRepository.create({
      ...data,
      createdBy: userId,
    });
    
    try {
      const saved = await this.assetTypeRepository.save(type);
      return await this.assetTypeRepository.findOne({
        where: { id: saved.id },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de activo con el nombre "${data.name}"`);
      }
      throw error;
    }
  }

  async getById(id: number) {
    return await this.assetTypeRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  async update(id: number, data: UpdateAssetTypeDto, userId: number) {
    try {
      await this.assetTypeRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de activo con el nombre "${data.name}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const types = await this.assetTypeRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    const data = types.map(t => ({
      'Name': t.name,
      'Sort Order': t.sortOrder,
      'Is Assignable': t.isAssignable ? 'Sí' : 'No',
      'Supports OS': t.supportsOs ? 'Sí' : 'No',
      'Is Active': t.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Types');

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const examples = [
      { 'Name': 'PC', 'Sort Order': 10, 'Is Assignable': 'No', 'Supports OS': 'Sí', 'Is Active': 'Sí' },
      { 'Name': 'PC portátil', 'Sort Order': 15, 'Is Assignable': 'Sí', 'Supports OS': 'Sí', 'Is Active': 'Sí' },
      { 'Name': 'Monitor', 'Sort Order': 50, 'Is Assignable': 'No', 'Supports OS': 'No', 'Is Active': 'Sí' },
      { 'Name': 'Mobile phone', 'Sort Order': 30, 'Is Assignable': 'Sí', 'Supports OS': 'Sí', 'Is Active': 'Sí' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Types');

    worksheet['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];

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
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header

      try {
        if (!row['Name']) {
          errores.push(`Fila ${rowNum}: Falta el campo Name`);
          continue;
        }

        const name = String(row['Name']).trim();
        const sortOrder = row['Sort Order'] ? parseInt(row['Sort Order']) : 0;
        const isAssignableStr = String(row['Is Assignable'] || 'No').trim().toLowerCase();
        const isAssignable = isAssignableStr === 'sí' || isAssignableStr === 'si' || isAssignableStr === 'yes' || isAssignableStr === 'true';
        const supportsOsStr = String(row['Supports OS'] || 'No').trim().toLowerCase();
        const supportsOs = supportsOsStr === 'sí' || supportsOsStr === 'si' || supportsOsStr === 'yes' || supportsOsStr === 'true';
        const isActiveStr = String(row['Is Active'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.assetTypeRepository.findOne({
          where: { name },
        });

        if (existing) {
          duplicados.push({
            fila: rowNum,
            nombre: name,
            idExistente: existing.id,
            datos: {
              name,
              sortOrder,
              isAssignable,
              supportsOs,
              isActive,
            }
          });
        } else {
          const newType = this.assetTypeRepository.create({
            name,
            sortOrder,
            isAssignable,
            supportsOs,
            isActive,
          });
          await this.assetTypeRepository.save(newType);
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
        await this.assetTypeRepository.update(dup.idExistente, dup.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Fila ${dup.fila}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
