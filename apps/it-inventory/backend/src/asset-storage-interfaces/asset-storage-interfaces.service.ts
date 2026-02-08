import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageInterface } from '../entities/asset-storage-interface.entity';
import { CreateStorageInterfaceDto, UpdateStorageInterfaceDto } from './dto/storage-interface.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetStorageInterfacesService {
  constructor(
    @InjectRepository(StorageInterface)
    private interfaceRepository: Repository<StorageInterface>,
  ) {}

  async getAll(): Promise<StorageInterface[]> {
    return this.interfaceRepository.find({
      relations: ['creator', 'updater'],
      order: { code: 'ASC' },
    });
  }

  async getById(id: number): Promise<StorageInterface> {
    const storageInterface = await this.interfaceRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!storageInterface) {
      throw new NotFoundException(`Interfaz de almacenamiento con ID ${id} no encontrada`);
    }

    return storageInterface;
  }

  async create(dto: CreateStorageInterfaceDto, userId: number): Promise<StorageInterface> {
    const storageInterface = this.interfaceRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });

    try {
      return await this.interfaceRepository.save(storageInterface);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe una interfaz de almacenamiento con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateStorageInterfaceDto, userId: number): Promise<StorageInterface> {
    const storageInterface = await this.getById(id);

    Object.assign(storageInterface, dto);
    storageInterface.updatedBy = userId;

    try {
      return await this.interfaceRepository.save(storageInterface);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe una interfaz de almacenamiento con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const interfaces = await this.getAll();

    const data = interfaces.map((si) => ({
      ID: si.id,
      Código: si.code,
      Nombre: si.name,
      Estado: si.isActive ? 'Activo' : 'Inactivo',
      'Creado por': si.creator?.userName || '',
      'Fecha creación': si.createdAt,
      'Modificado por': si.updater?.userName || '',
      'Fecha modificación': si.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Interfaces');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const data = [
      {
        Código: 'SATA',
        Nombre: 'SATA III (6 Gb/s)',
        Estado: 'Activo',
      },
      {
        Código: 'NVME',
        Nombre: 'NVMe PCIe 3.0',
        Estado: 'Activo',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Interfaces');

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

        const existingInterface = await this.interfaceRepository.findOne({ where: { code } });

        if (existingInterface) {
          duplicados.push(rowData);
        } else {
          const storageInterface = this.interfaceRepository.create({
            code,
            name,
            isActive: estado === 'Activo' || estado === 'activo',
            createdBy: userId,
            updatedBy: userId,
          });

          await this.interfaceRepository.save(storageInterface);
          insertados.push(storageInterface);
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
      const storageInterface = await this.interfaceRepository.findOne({ where: { code } });

      if (storageInterface) {
        storageInterface.name = duplicate['Nombre'];
        storageInterface.isActive = duplicate['Estado'] === 'Activo' || duplicate['Estado'] === 'activo';
        storageInterface.updatedBy = userId;

        await this.interfaceRepository.save(storageInterface);
        actualizados++;
      }
    }

    return { actualizados };
  }
}
