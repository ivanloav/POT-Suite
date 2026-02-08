import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageDriveType } from '../entities/asset-storage-drive-type.entity';
import { CreateStorageDriveTypeDto, UpdateStorageDriveTypeDto } from './dto/storage-drive-type.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetStorageDriveTypesService {
  constructor(
    @InjectRepository(StorageDriveType)
    private driveTypeRepository: Repository<StorageDriveType>,
  ) {}

  async getAll(): Promise<StorageDriveType[]> {
    return this.driveTypeRepository.find({
      relations: ['creator', 'updater'],
      order: { code: 'ASC' },
    });
  }

  async getById(id: number): Promise<StorageDriveType> {
    const driveType = await this.driveTypeRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!driveType) {
      throw new NotFoundException(`Tipo de disco con ID ${id} no encontrado`);
    }

    return driveType;
  }

  async create(dto: CreateStorageDriveTypeDto, userId: number): Promise<StorageDriveType> {
    const driveType = this.driveTypeRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });

    try {
      return await this.driveTypeRepository.save(driveType);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de disco con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateStorageDriveTypeDto, userId: number): Promise<StorageDriveType> {
    const driveType = await this.getById(id);

    Object.assign(driveType, dto);
    driveType.updatedBy = userId;

    try {
      return await this.driveTypeRepository.save(driveType);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un tipo de disco con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const driveTypes = await this.getAll();

    const data = driveTypes.map((dt) => ({
      ID: dt.id,
      Código: dt.code,
      Nombre: dt.name,
      Estado: dt.isActive ? 'Activo' : 'Inactivo',
      'Creado por': dt.creator?.userName || '',
      'Fecha creación': dt.createdAt,
      'Modificado por': dt.updater?.userName || '',
      'Fecha modificación': dt.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos Disco');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const data = [
      {
        Código: 'HDD',
        Nombre: 'Hard Disk Drive',
        Estado: 'Activo',
      },
      {
        Código: 'SSD',
        Nombre: 'Solid State Drive',
        Estado: 'Activo',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos Disco');

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

        const existingType = await this.driveTypeRepository.findOne({ where: { code } });

        if (existingType) {
          duplicados.push(rowData);
        } else {
          const driveType = this.driveTypeRepository.create({
            code,
            name,
            isActive: estado === 'Activo' || estado === 'activo',
            createdBy: userId,
            updatedBy: userId,
          });

          await this.driveTypeRepository.save(driveType);
          insertados.push(driveType);
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
      const driveType = await this.driveTypeRepository.findOne({ where: { code } });

      if (driveType) {
        driveType.name = duplicate['Nombre'];
        driveType.isActive = duplicate['Estado'] === 'Activo' || duplicate['Estado'] === 'activo';
        driveType.updatedBy = userId;

        await this.driveTypeRepository.save(driveType);
        actualizados++;
      }
    }

    return { actualizados };
  }
}
