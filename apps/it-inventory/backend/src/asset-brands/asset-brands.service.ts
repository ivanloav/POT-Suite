import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetBrand } from '../entities/asset-brand.entity';
import { CreateAssetBrandDto, UpdateAssetBrandDto } from './dto/asset-brand.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetBrandsService {
  constructor(
    @InjectRepository(AssetBrand)
    private readonly assetBrandRepository: Repository<AssetBrand>,
  ) {}

  async getAll() {
    return await this.assetBrandRepository.find({
      relations: ['creator', 'updater'],
      order: { id: 'DESC' },
    });
  }

  async create(data: CreateAssetBrandDto, userId: number) {
    const brand = this.assetBrandRepository.create({
      ...data,
      createdBy: userId,
    });
    
    try {
      const saved = await this.assetBrandRepository.save(brand);
      return await this.assetBrandRepository.findOne({
        where: { id: saved.id },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe una marca con el nombre "${data.name}"`);
      }
      throw error;
    }
  }

  async getById(id: number) {
    return await this.assetBrandRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  async update(id: number, data: UpdateAssetBrandDto, userId: number) {
    try {
      await this.assetBrandRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe una marca con el nombre "${data.name}"`);
      }
      throw error;
    }
  }

  // Exportar a Excel
  async exportToExcel(): Promise<Buffer> {
    const brands = await this.assetBrandRepository.find({
      order: { name: 'ASC' },
    });

    const data = brands.map(b => ({
      'Name': b.name,
      'Is Active': b.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Brands');

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Generar plantilla
  async generateTemplate(): Promise<Buffer> {
    const examples = [
      { 'Name': 'Apple', 'Is Active': 'Sí' },
      { 'Name': 'Dell', 'Is Active': 'Sí' },
      { 'Name': 'HP', 'Is Active': 'Sí' },
      { 'Name': 'Lenovo', 'Is Active': 'Sí' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Brands');

    worksheet['!cols'] = [{ wch: 30 }, { wch: 10 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Importar desde Excel
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
        const isActiveStr = String(row['Is Active'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.assetBrandRepository.findOne({
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
          const newBrand = this.assetBrandRepository.create({
            name,
            isActive,
            createdBy: userId,
          });
          await this.assetBrandRepository.save(newBrand);
          insertados++;
        }
      } catch (error: any) {
        errores.push(`Fila ${rowNum}: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }

  // Actualizar duplicados
  async updateDuplicatesFromExcel(duplicates: any[]): Promise<{ actualizados: number; errores: string[] }> {
    const errores: string[] = [];
    let actualizados = 0;

    for (const dup of duplicates) {
      try {
        await this.assetBrandRepository.update(dup.idExistente, dup.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Fila ${dup.fila}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
