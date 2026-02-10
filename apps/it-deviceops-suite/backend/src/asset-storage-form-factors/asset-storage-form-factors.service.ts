import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageFormFactor } from '../entities/asset-storage-form-factor.entity';
import { CreateStorageFormFactorDto, UpdateStorageFormFactorDto } from './dto/storage-form-factor.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetStorageFormFactorsService {
  constructor(
    @InjectRepository(StorageFormFactor)
    private formFactorRepository: Repository<StorageFormFactor>,
  ) {}

  async getAll(): Promise<StorageFormFactor[]> {
    return this.formFactorRepository.find({
      relations: ['creator', 'updater'],
      order: { code: 'ASC' },
    });
  }

  async getById(id: number): Promise<StorageFormFactor> {
    const formFactor = await this.formFactorRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!formFactor) {
      throw new NotFoundException(`Form factor de almacenamiento con ID ${id} no encontrado`);
    }

    return formFactor;
  }

  async create(dto: CreateStorageFormFactorDto, userId: number): Promise<StorageFormFactor> {
    const formFactor = this.formFactorRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });

    try {
      return await this.formFactorRepository.save(formFactor);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un form factor de almacenamiento con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateStorageFormFactorDto, userId: number): Promise<StorageFormFactor> {
    const formFactor = await this.getById(id);

    Object.assign(formFactor, dto);
    formFactor.updatedBy = userId;

    try {
      return await this.formFactorRepository.save(formFactor);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un form factor de almacenamiento con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const formFactors = await this.getAll();

    const data = formFactors.map((ff) => ({
      ID: ff.id,
      Código: ff.code,
      Nombre: ff.name,
      Estado: ff.isActive ? 'Activo' : 'Inactivo',
      'Creado por': ff.creator?.userName || '',
      'Fecha creación': ff.createdAt,
      'Modificado por': ff.updater?.userName || '',
      'Fecha modificación': ff.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Factors');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const data = [
      {
        Código: '2.5',
        Nombre: '2.5" (63.5mm)',
        Estado: 'Activo',
      },
      {
        Código: 'M.2',
        Nombre: 'M.2 2280',
        Estado: 'Activo',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Factors');

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

        const existingFormFactor = await this.formFactorRepository.findOne({ where: { code } });

        if (existingFormFactor) {
          duplicados.push(rowData);
        } else {
          const formFactor = this.formFactorRepository.create({
            code,
            name,
            isActive: estado === 'Activo' || estado === 'activo',
            createdBy: userId,
            updatedBy: userId,
          });

          await this.formFactorRepository.save(formFactor);
          insertados.push(formFactor);
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
      const formFactor = await this.formFactorRepository.findOne({ where: { code } });

      if (formFactor) {
        formFactor.name = duplicate['Nombre'];
        formFactor.isActive = duplicate['Estado'] === 'Activo' || duplicate['Estado'] === 'activo';
        formFactor.updatedBy = userId;

        await this.formFactorRepository.save(formFactor);
        actualizados++;
      }
    }

    return { actualizados };
  }
}
