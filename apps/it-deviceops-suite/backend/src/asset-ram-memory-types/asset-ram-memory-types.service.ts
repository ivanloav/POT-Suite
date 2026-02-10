import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetRamMemoryType } from '../entities/asset-ram-memory-type.entity';
import { CreateRamMemoryTypeDto, UpdateRamMemoryTypeDto } from './dto/ram-memory-type.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetRamMemoryTypesService {
  constructor(
    @InjectRepository(AssetRamMemoryType)
    private memoryTypeRepository: Repository<AssetRamMemoryType>,
  ) {}

  async getAll(): Promise<AssetRamMemoryType[]> {
    return this.memoryTypeRepository.find({
      relations: ['creator', 'updater'],
      order: { code: 'ASC' },
    });
  }

  async getById(id: number): Promise<AssetRamMemoryType> {
    const memoryType = await this.memoryTypeRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!memoryType) {
      throw new NotFoundException(`Tipo de memoria RAM con ID ${id} no encontrado`);
    }

    return memoryType;
  }

  async create(dto: CreateRamMemoryTypeDto, userId: number): Promise<AssetRamMemoryType> {
    const memoryType = this.memoryTypeRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });

    try {
      return await this.memoryTypeRepository.save(memoryType);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de memoria RAM con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateRamMemoryTypeDto, userId: number): Promise<AssetRamMemoryType> {
    const memoryType = await this.getById(id);

    Object.assign(memoryType, dto);
    memoryType.updatedBy = userId;

    try {
      return await this.memoryTypeRepository.save(memoryType);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de memoria RAM con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const memoryTypes = await this.getAll();

    const data = memoryTypes.map((type) => ({
      ID: type.id,
      Código: type.code,
      Nombre: type.name,
      Estado: type.isActive ? 'Activo' : 'Inactivo',
      'Creado por': type.creator?.userName || '',
      'Fecha creación': type.createdAt,
      'Modificado por': type.updater?.userName || '',
      'Fecha modificación': type.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos Memoria RAM');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const data = [
      {
        Código: 'DDR3',
        Nombre: 'DDR3 SDRAM',
        Estado: 'Activo',
      },
      {
        Código: 'DDR4',
        Nombre: 'DDR4 SDRAM',
        Estado: 'Activo',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos Memoria RAM');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(file: any, userId: number) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    const insertados = [];
    const duplicados = [];
    const errores = [];

    for (const row of rows) {
      try {
        const rowData = row as any;
        const code = rowData['Código'] || rowData['Codigo'];
        const name = rowData['Nombre'];
        const estado = rowData['Estado'];

        if (!code || !name) {
          errores.push(`Fila con datos incompletos: ${JSON.stringify(rowData)}`);
          continue;
        }

        const existingType = await this.memoryTypeRepository.findOne({ where: { code } });

        if (existingType) {
          duplicados.push(rowData);
        } else {
          const memoryType = this.memoryTypeRepository.create({
            code,
            name,
            isActive: estado === 'Activo' || estado === 'activo',
            createdBy: userId,
            updatedBy: userId,
          });

          await this.memoryTypeRepository.save(memoryType);
          insertados.push(memoryType);
        }
      } catch (error) {
        errores.push(`Error procesando fila: ${(error as any).message}`);
      }
    }

    return {
      insertados: insertados.length,
      duplicados,
      errores,
    };
  }

  async updateDuplicatesFromExcel(duplicates: any[], userId: number) {
    let actualizados = 0;

    for (const duplicate of duplicates) {
      const code = duplicate['Código'] || duplicate['Codigo'];
      const memoryType = await this.memoryTypeRepository.findOne({ where: { code } });

      if (memoryType) {
        memoryType.name = duplicate['Nombre'];
        memoryType.isActive = duplicate['Estado'] === 'Activo' || duplicate['Estado'] === 'activo';
        memoryType.updatedBy = userId;

        await this.memoryTypeRepository.save(memoryType);
        actualizados++;
      }
    }

    return { actualizados };
  }
}
