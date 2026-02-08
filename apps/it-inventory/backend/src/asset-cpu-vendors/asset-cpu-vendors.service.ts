import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CpuVendor } from '../entities/asset-cpu-vendor.entity';
import { CreateCpuVendorDto, UpdateCpuVendorDto } from './dto/cpu-vendor.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetCpuVendorsService {
  constructor(
    @InjectRepository(CpuVendor)
    private readonly cpuVendorRepository: Repository<CpuVendor>,
  ) {}

  async getAll() {
    return await this.cpuVendorRepository.find({
      relations: ['creator', 'updater'],
      order: { code: 'ASC' },
    });
  }

  async getById(id: number) {
    return await this.cpuVendorRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  async create(data: CreateCpuVendorDto, userId: number) {
    const vendor = this.cpuVendorRepository.create({
      ...data,
      createdBy: userId,
    });
    
    try {
      const saved = await this.cpuVendorRepository.save(vendor);
      return await this.cpuVendorRepository.findOne({
        where: { id: saved.id },
        relations: ['creator', 'updater'],
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un vendedor de CPU con el código "${data.code}"`);
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateCpuVendorDto, userId: number) {
    try {
      await this.cpuVendorRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un vendedor de CPU con el código "${data.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const vendors = await this.cpuVendorRepository.find({
      relations: ['creator', 'updater'],
      order: { code: 'ASC' },
    });

    const data = vendors.map((vendor) => ({
      ID: vendor.id,
      Código: vendor.code,
      Nombre: vendor.name,
      Activo: vendor.isActive ? 'Sí' : 'No',
      'Creado por': vendor.creator?.userName || '',
      'Fecha creación': vendor.createdAt ? new Date(vendor.createdAt).toLocaleString('es-ES') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendedores CPU');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const data = [
      { Código: 'INTEL', Nombre: 'Intel Corporation', Activo: 'Sí' },
      { Código: 'AMD', Nombre: 'AMD', Activo: 'Sí' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendedores CPU');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer, userId: number) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const result = {
      insertados: 0,
      duplicados: [] as any[],
      errores: [] as any[],
    };

    for (const row of data) {
      const rowData = row as any;
      try {
        const code = (rowData['Código'] || '').toString().trim();
        const name = (rowData['Nombre'] || '').toString().trim();
        const isActive = (rowData['Activo'] || 'Sí').toString().toLowerCase() === 'sí';

        if (!code || !name) {
          result.errores.push({
            fila: rowData,
            error: 'Código y Nombre son requeridos',
          });
          continue;
        }

        const existing = await this.cpuVendorRepository.findOne({
          where: { code },
        });

        if (existing) {
          result.duplicados.push({
            ...rowData,
            id: existing.id,
          });
        } else {
          await this.create({ code, name, isActive }, userId);
          result.insertados++;
        }
      } catch (error: any) {
        result.errores.push({
          fila: rowData,
          error: error.message,
        });
      }
    }

    return result;
  }

  async updateDuplicatesFromExcel(duplicates: any[], userId: number) {
    const result = {
      actualizados: 0,
      errores: [] as any[],
    };

    for (const item of duplicates) {
      try {
        const code = (item['Código'] || '').toString().trim();
        const name = (item['Nombre'] || '').toString().trim();
        const isActive = (item['Activo'] || 'Sí').toString().toLowerCase() === 'sí';

        await this.update(item.id, { code, name, isActive }, userId);
        result.actualizados++;
      } catch (error: any) {
        result.errores.push({
          item,
          error: error.message,
        });
      }
    }

    return result;
  }
}
