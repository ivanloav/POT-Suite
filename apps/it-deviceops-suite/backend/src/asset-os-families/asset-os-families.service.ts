import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetOsFamily } from '../entities/asset-os-family.entity';
import { CreateOsFamilyDto, UpdateOsFamilyDto } from './dto/asset-os-family.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetOsFamiliesService {
  constructor(
    @InjectRepository(AssetOsFamily)
    private readonly assetOsFamilyRepository: Repository<AssetOsFamily>,
  ) {}

  async getOsFamilies() {
    return await this.assetOsFamilyRepository.find({
      relations: ['creator', 'updater'],
      order: { id: 'ASC' },
    });
  }

  async createOsFamily(data: CreateOsFamilyDto, userId: number) {
    const osFamily = this.assetOsFamilyRepository.create({
      ...data,
      createdBy: userId,
    });
    
    try {
      const saved = await this.assetOsFamilyRepository.save(osFamily);
      return await this.assetOsFamilyRepository.findOne({
        where: { id: saved.id },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe una familia de SO con el nombre "${data.name}"`);
      }
      throw error;
    }
  }

  async getOsFamilyById(id: number) {
    return await this.assetOsFamilyRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  async updateOsFamily(id: number, data: UpdateOsFamilyDto, userId: number) {
    try {
      await this.assetOsFamilyRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getOsFamilyById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe una familia de SO con el nombre "${data.name}"`);
      }
      throw error;
    }
  }

  async exportOsFamiliesToExcel(): Promise<Buffer> {
    const osFamilies = await this.assetOsFamilyRepository.find({
      order: { id: 'ASC' },
    });

    const data = osFamilies.map(f => ({
      'Name': f.name,
      'Is Active': f.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OS Families');

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateOsFamiliesTemplate(): Promise<Buffer> {
    const examples = [
      { 'Name': 'Windows', 'Is Active': 'Sí' },
      { 'Name': 'macOS', 'Is Active': 'Sí' },
      { 'Name': 'Linux', 'Is Active': 'Sí' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OS Families');

    worksheet['!cols'] = [{ wch: 30 }, { wch: 10 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importOsFamiliesFromExcel(buffer: Buffer, userId: number): Promise<{ insertados: number; duplicados: any[]; errores: string[] }> {
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
        const isActiveStr = String(row['Is Active'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.assetOsFamilyRepository.findOne({
          where: { name },
        });

        if (existing) {
          duplicados.push({
            fila: rowNum,
            nombre: name,
            idExistente: existing.id,
            datos: {
              name,
              isActive,
              updatedBy: userId,
            }
          });
        } else {
          const newFamily = this.assetOsFamilyRepository.create({
            name,
            isActive,
            createdBy: userId,
          });
          await this.assetOsFamilyRepository.save(newFamily);
          insertados++;
        }
      } catch (error: any) {
        errores.push(`Fila ${rowNum}: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }

  async updateOsFamiliesDuplicatesFromExcel(duplicates: any[]): Promise<{ actualizados: number; errores: string[] }> {
    const errores: string[] = [];
    let actualizados = 0;

    for (const dup of duplicates) {
      try {
        await this.assetOsFamilyRepository.update(dup.idExistente, dup.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Fila ${dup.fila}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
