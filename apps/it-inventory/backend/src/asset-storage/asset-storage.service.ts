import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageOption } from '../entities/storage-option.entity';
import { StorageDriveType } from '../entities/asset-storage-drive-type.entity';
import { StorageInterface } from '../entities/asset-storage-interface.entity';
import { StorageFormFactor } from '../entities/asset-storage-form-factor.entity';
import { CreateAssetStorageDto } from './dto/asset-storage.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetStorageService {
  constructor(
    @InjectRepository(StorageOption)
    private readonly storageOptionRepository: Repository<StorageOption>,
    @InjectRepository(StorageDriveType)
    private readonly storageDriveTypeRepository: Repository<StorageDriveType>,
    @InjectRepository(StorageInterface)
    private readonly storageInterfaceRepository: Repository<StorageInterface>,
    @InjectRepository(StorageFormFactor)
    private readonly storageFormFactorRepository: Repository<StorageFormFactor>,
  ) {}

  // Obtener todas las opciones de almacenamiento
  async getAll() {
    return await this.storageOptionRepository.find({
      relations: ['creator', 'updater', 'driveType', 'interface', 'formFactor'],
      order: { capacityGb: 'ASC' },
    });
  }

  // Obtener opción de almacenamiento por ID
  async getById(id: number) {
    return await this.storageOptionRepository.findOne({
      where: { id },
      relations: ['creator', 'updater', 'driveType', 'interface', 'formFactor'],
    });
  }

  // Crear nueva opción de almacenamiento
  async create(data: CreateAssetStorageDto, userId: number) {
    // Validar que el tipo de disco existe
    const driveType = await this.storageDriveTypeRepository.findOne({ where: { id: data.driveTypeId } });
    if (!driveType) {
      throw new BadRequestException(`Tipo de disco con ID ${data.driveTypeId} no encontrado`);
    }

    // Validar interfaz si se proporciona
    if (data.interfaceId) {
      const storageInterface = await this.storageInterfaceRepository.findOne({ where: { id: data.interfaceId } });
      if (!storageInterface) {
        throw new BadRequestException(`Interfaz con ID ${data.interfaceId} no encontrada`);
      }
    }

    // Validar form factor si se proporciona
    if (data.formFactorId) {
      const formFactor = await this.storageFormFactorRepository.findOne({ where: { id: data.formFactorId } });
      if (!formFactor) {
        throw new BadRequestException(`Form Factor con ID ${data.formFactorId} no encontrado`);
      }
    }

    const storageOption = this.storageOptionRepository.create({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });
    try {
      return await this.storageOptionRepository.save(storageOption);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_storage')) {
          throw new ConflictException('Ya existe un almacenamiento con esa configuración');
        }
        throw new ConflictException('Ya existe un almacenamiento con esos datos');
      }
      throw error;
    }
  }

  // Actualizar opción de almacenamiento
  async update(id: number, data: Partial<CreateAssetStorageDto>, userId: number) {
    // Validar que el tipo de disco existe si se proporciona
    if (data.driveTypeId) {
      const driveType = await this.storageDriveTypeRepository.findOne({ where: { id: data.driveTypeId } });
      if (!driveType) {
        throw new BadRequestException(`Tipo de disco con ID ${data.driveTypeId} no encontrado`);
      }
    }

    // Validar interfaz si se proporciona
    if (data.interfaceId) {
      const storageInterface = await this.storageInterfaceRepository.findOne({ where: { id: data.interfaceId } });
      if (!storageInterface) {
        throw new BadRequestException(`Interfaz con ID ${data.interfaceId} no encontrada`);
      }
    }

    // Validar form factor si se proporciona
    if (data.formFactorId) {
      const formFactor = await this.storageFormFactorRepository.findOne({ where: { id: data.formFactorId } });
      if (!formFactor) {
        throw new BadRequestException(`Form Factor con ID ${data.formFactorId} no encontrado`);
      }
    }

    try {
      await this.storageOptionRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_storage')) {
          throw new ConflictException('Ya existe un almacenamiento con esa configuración');
        }
        throw new ConflictException('Ya existe un almacenamiento con esos datos');
      }
      throw error;
    }
  }

  // Exportar opciones de almacenamiento a Excel
  async exportToExcel(): Promise<Buffer> {
    const storageOptions = await this.storageOptionRepository.find({
      relations: ['creator', 'driveType', 'interface', 'formFactor'],
      order: { id: 'ASC' },
    });

    const data = storageOptions.map(storage => ({
      'ID': storage.id,
      'Capacidad (GB)': storage.capacityGb,
      'Tipo Disco': storage.driveType?.name || '',
      'Interfaz': storage.interface?.name || '',
      'Form Factor': storage.formFactor?.name || '',
      'Notas': storage.notes || '',
      'Estado': storage.isActive ? 'Activo' : 'Inactivo',
      'Creado por': storage.creator?.userName || '',
      'Fecha creación': storage.createdAt ? new Date(storage.createdAt).toLocaleString('es-ES') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Almacenamiento');

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Generar plantilla de ejemplo para importación
  async generateTemplate(): Promise<Buffer> {
    const driveTypes = await this.storageDriveTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const interfaces = await this.storageInterfaceRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const formFactors = await this.storageFormFactorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const examples = [
      {
        'Capacidad (GB)': 256,
        'Tipo Disco': 'SSD',
        'Interfaz': 'SATA',
        'Form Factor': '2.5"',
        'Notas': '',
        'Activo': 'Sí',
      },
      {
        'Capacidad (GB)': 512,
        'Tipo Disco': 'SSD',
        'Interfaz': 'NVMe',
        'Form Factor': 'M.2',
        'Notas': '',
        'Activo': 'Sí',
      },
      {
        'Capacidad (GB)': 1024,
        'Tipo Disco': 'HDD',
        'Interfaz': 'SATA',
        'Form Factor': '3.5"',
        'Notas': 'Alta capacidad',
        'Activo': 'Sí',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Almacenamiento');

    // Añadir hoja con tipos de disco disponibles
    const driveTypesData = driveTypes.map(d => ({ 'Tipos de Disco Disponibles': d.name }));
    const driveTypesSheet = XLSX.utils.json_to_sheet(driveTypesData);
    XLSX.utils.book_append_sheet(workbook, driveTypesSheet, 'Tipos de Disco');

    // Añadir hoja con interfaces disponibles
    const interfacesData = interfaces.map(i => ({ 'Interfaces Disponibles': i.name }));
    const interfacesSheet = XLSX.utils.json_to_sheet(interfacesData);
    XLSX.utils.book_append_sheet(workbook, interfacesSheet, 'Interfaces');

    // Añadir hoja con form factors disponibles
    const formFactorsData = formFactors.map(f => ({ 'Form Factors Disponibles': f.name }));
    const formFactorsSheet = XLSX.utils.json_to_sheet(formFactorsData);
    XLSX.utils.book_append_sheet(workbook, formFactorsSheet, 'Form Factors');

    worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 10 }];
    driveTypesSheet['!cols'] = [{ wch: 30 }];
    interfacesSheet['!cols'] = [{ wch: 30 }];
    formFactorsSheet['!cols'] = [{ wch: 30 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Importar opciones de almacenamiento desde Excel
  async importFromExcel(buffer: Buffer, userId: number): Promise<{ 
    insertados: number; 
    duplicados: any[]; 
    errores: string[];
  }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const errores: string[] = [];
    const duplicados: any[] = [];
    let insertados = 0;

    // Cargar todos los tipos de disco, interfaces y form factors
    const driveTypes = await this.storageDriveTypeRepository.find();
    const driveTypeMap = new Map(driveTypes.map(d => [d.name.toLowerCase(), d]));

    const interfaces = await this.storageInterfaceRepository.find();
    const interfaceMap = new Map(interfaces.map(i => [i.name.toLowerCase(), i]));

    const formFactors = await this.storageFormFactorRepository.find();
    const formFactorMap = new Map(formFactors.map(f => [f.name.toLowerCase(), f]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header

      try {
        // Validar campos requeridos
        if (!row['Capacidad (GB)'] || !row['Tipo Disco']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (Capacidad (GB), Tipo Disco)`);
          continue;
        }

        const capacityGb = parseInt(String(row['Capacidad (GB)']));
        
        const driveTypeName = String(row['Tipo Disco']).trim();
        const driveType = driveTypeMap.get(driveTypeName.toLowerCase());

        if (!driveType) {
          errores.push(`Fila ${rowNum}: Tipo de Disco "${driveTypeName}" no encontrado`);
          continue;
        }

        let interfaceId = null;
        if (row['Interfaz']) {
          const interfaceName = String(row['Interfaz']).trim();
          const storageInterface = interfaceMap.get(interfaceName.toLowerCase());
          if (storageInterface) {
            interfaceId = storageInterface.id;
          }
        }

        let formFactorId = null;
        if (row['Form Factor']) {
          const formFactorName = String(row['Form Factor']).trim();
          const formFactor = formFactorMap.get(formFactorName.toLowerCase());
          if (formFactor) {
            formFactorId = formFactor.id;
          }
        }

        const notes = row['Notas'] ? String(row['Notas']).trim() : null;
        
        const isActiveStr = String(row['Activo'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        // Buscar si ya existe (por capacidad, tipo de disco, interfaz y form factor)
        const queryBuilder = this.storageOptionRepository
          .createQueryBuilder('storage')
          .where('storage.capacityGb = :capacityGb', { capacityGb })
          .andWhere('storage.driveTypeId = :driveTypeId', { driveTypeId: driveType.id });

        if (interfaceId) {
          queryBuilder.andWhere('storage.interfaceId = :interfaceId', { interfaceId });
        } else {
          queryBuilder.andWhere('storage.interfaceId IS NULL');
        }

        if (formFactorId) {
          queryBuilder.andWhere('storage.formFactorId = :formFactorId', { formFactorId });
        } else {
          queryBuilder.andWhere('storage.formFactorId IS NULL');
        }

        const existing = await queryBuilder.getOne();

        if (existing) {
          // Detectar duplicado
          duplicados.push({
            fila: rowNum,
            'Capacidad (GB)': capacityGb,
            'Tipo Disco': driveTypeName,
            'Interfaz': row['Interfaz'] || '',
            'Form Factor': row['Form Factor'] || '',
            idExistente: existing.id,
            datos: {
              capacityGb,
              driveTypeId: driveType.id,
              interfaceId,
              formFactorId,
              notes,
              isActive,
              updatedBy: userId,
            }
          });
        } else {
          // Crear nuevo
          const newStorage = this.storageOptionRepository.create({
            capacityGb,
            driveTypeId: driveType.id,
            interfaceId,
            formFactorId,
            notes,
            isActive,
            createdBy: userId,
            updatedBy: userId,
          });
          await this.storageOptionRepository.save(newStorage);
          insertados++;
        }
      } catch (error: any) {
        errores.push(`Fila ${rowNum}: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }

  // Actualizar duplicados desde Excel
  async updateDuplicatesFromExcel(duplicates: any[]): Promise<{ actualizados: number; errores: string[] }> {
    const errores: string[] = [];
    let actualizados = 0;

    for (const duplicate of duplicates) {
      try {
        await this.storageOptionRepository.update(duplicate.idExistente, duplicate.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Error al actualizar Almacenamiento ${duplicate['Capacidad (GB)']}GB: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
