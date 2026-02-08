import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetRamOption } from '../entities/asset-ram-option.entity';
import { AssetRamFormFactor } from '../entities/asset-ram-form-factor.entity';
import { AssetRamMemoryType } from '../entities/asset-ram-memory-type.entity';
import { CreateAssetRamDto } from './dto/asset-ram.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetRamService {
  constructor(
    @InjectRepository(AssetRamOption)
    private readonly assetRamOptionRepository: Repository<AssetRamOption>,
    @InjectRepository(AssetRamFormFactor)
    private readonly ramFormFactorRepository: Repository<AssetRamFormFactor>,
    @InjectRepository(AssetRamMemoryType)
    private readonly ramMemoryTypeRepository: Repository<AssetRamMemoryType>,
  ) {}

  // Asset RAMs
  async getAssetRams(memTypeId?: number, formFactorId?: number) {
    const queryBuilder = this.assetRamOptionRepository
      .createQueryBuilder('ram')
      .leftJoinAndSelect('ram.memType', 'memType')
      .leftJoinAndSelect('ram.formFactor', 'formFactor')
      .leftJoinAndSelect('ram.creator', 'creator')
      .leftJoinAndSelect('ram.updater', 'updater');

    if (memTypeId) {
      queryBuilder.andWhere('ram.memTypeId = :memTypeId', { memTypeId });
    }

    if (formFactorId) {
      queryBuilder.andWhere('ram.formFactorId = :formFactorId', { formFactorId });
    }

    return await queryBuilder
      .orderBy('ram.id', 'ASC')
      .getMany();
  }

  async getRamMemoryTypes() {
    return await this.ramMemoryTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getRamFormFactors() {
    return await this.ramFormFactorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createAssetRam(data: CreateAssetRamDto) {
    // Validar que el memory type existe
    const memType = await this.ramMemoryTypeRepository.findOne({ where: { id: data.memTypeId } });
    if (!memType) {
      throw new BadRequestException(`Memory Type con ID ${data.memTypeId} no encontrado`);
    }

    // Validar form factor si se proporciona
    if (data.formFactorId) {
      const formFactor = await this.ramFormFactorRepository.findOne({ where: { id: data.formFactorId } });
      if (!formFactor) {
        throw new BadRequestException(`Form Factor con ID ${data.formFactorId} no encontrado`);
      }
    }

    const assetRam = this.assetRamOptionRepository.create(data);
    try {
      return await this.assetRamOptionRepository.save(assetRam);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_ram')) {
          throw new ConflictException('Ya existe una RAM con esa configuración');
        }
        throw new ConflictException('Ya existe una RAM con esos datos');
      }
      throw error;
    }
  }

  async getAssetRamById(id: number) {
    return await this.assetRamOptionRepository.findOne({
      where: { id },
      relations: ['memType', 'formFactor', 'creator', 'updater'],
    });
  }

  async updateAssetRam(id: number, data: Partial<CreateAssetRamDto>) {
    // Validar que el memory type existe si se proporciona
    if (data.memTypeId) {
      const memType = await this.ramMemoryTypeRepository.findOne({ where: { id: data.memTypeId } });
      if (!memType) {
        throw new BadRequestException(`Memory Type con ID ${data.memTypeId} no encontrado`);
      }
    }

    // Validar form factor si se proporciona
    if (data.formFactorId) {
      const formFactor = await this.ramFormFactorRepository.findOne({ where: { id: data.formFactorId } });
      if (!formFactor) {
        throw new BadRequestException(`Form Factor con ID ${data.formFactorId} no encontrado`);
      }
    }

    try {
      await this.assetRamOptionRepository.update(id, data);
      return this.getAssetRamById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_ram')) {
          throw new ConflictException('Ya existe una RAM con esa configuración');
        }
        throw new ConflictException('Ya existe una RAM con esos datos');
      }
      throw error;
    }
  }

  // Exportar RAM a Excel
  async exportToExcel(): Promise<Buffer> {
    const assetRams = await this.assetRamOptionRepository.find({
      relations: ['memType', 'formFactor'],
      order: { id: 'ASC' },
    });

    const data = assetRams.map(ram => ({
      'Capacidad GB': ram.capacityGb,
      'Tipo de Memoria': ram.memType?.name || '',
      'Velocidad MT/s': ram.speedMts || '',
      'Form Factor': ram.formFactor?.name || '',
      'Notas': ram.notes || '',
      'Activo': ram.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RAM');

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Generar plantilla de ejemplo para importación
  async generateTemplate(): Promise<Buffer> {
    const memoryTypes = await this.ramMemoryTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const formFactors = await this.ramFormFactorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const examples = [
      {
        'Capacidad GB': 8,
        'Tipo de Memoria': 'DDR4',
        'Velocidad MT/s': 3200,
        'Form Factor': 'SODIMM',
        'Notas': '',
        'Activo': 'Sí',
      },
      {
        'Capacidad GB': 16,
        'Tipo de Memoria': 'DDR5',
        'Velocidad MT/s': 5600,
        'Form Factor': 'DIMM',
        'Notas': '',
        'Activo': 'Sí',
      },
      {
        'Capacidad GB': 32,
        'Tipo de Memoria': 'DDR5',
        'Velocidad MT/s': 6400,
        'Form Factor': 'SODIMM',
        'Notas': 'Alta velocidad',
        'Activo': 'Sí',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RAM');

    // Añadir hoja con tipos de memoria disponibles
    const memTypesData = memoryTypes.map(m => ({ 'Tipos de Memoria Disponibles': m.name }));
    const memTypesSheet = XLSX.utils.json_to_sheet(memTypesData);
    XLSX.utils.book_append_sheet(workbook, memTypesSheet, 'Tipos de Memoria');

    // Añadir hoja con form factors disponibles
    const formFactorsData = formFactors.map(f => ({ 'Form Factors Disponibles': f.name }));
    const formFactorsSheet = XLSX.utils.json_to_sheet(formFactorsData);
    XLSX.utils.book_append_sheet(workbook, formFactorsSheet, 'Form Factors');

    worksheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 10 }];
    memTypesSheet['!cols'] = [{ wch: 30 }];
    formFactorsSheet['!cols'] = [{ wch: 30 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Importar RAM desde Excel
  async importFromExcel(buffer: Buffer, userId: number): Promise<{ 
    insertados: number; 
    duplicados: any[]; 
    errores: string[];
    datos?: any[];
  }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const errores: string[] = [];
    const duplicados: any[] = [];
    let insertados = 0;

    // Cargar todos los memory types y form factors
    const memoryTypes = await this.ramMemoryTypeRepository.find();
    const memTypeMap = new Map(memoryTypes.map(m => [m.name.toLowerCase(), m]));

    const formFactors = await this.ramFormFactorRepository.find();
    const formFactorMap = new Map(formFactors.map(f => [f.name.toLowerCase(), f]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header

      try {
        // Validar campos requeridos
        if (!row['Capacidad GB'] || !row['Tipo de Memoria']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (Capacidad GB, Tipo de Memoria)`);
          continue;
        }

        const capacityGb = parseInt(String(row['Capacidad GB']));
        
        const memTypeName = String(row['Tipo de Memoria']).trim();
        const memType = memTypeMap.get(memTypeName.toLowerCase());

        if (!memType) {
          errores.push(`Fila ${rowNum}: Tipo de Memoria "${memTypeName}" no encontrado`);
          continue;
        }

        const speedMts = row['Velocidad MT/s'] ? parseInt(String(row['Velocidad MT/s'])) : null;
        
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

        // Buscar si ya existe (por capacidad, tipo y velocidad)
        const queryBuilder = this.assetRamOptionRepository
          .createQueryBuilder('ram')
          .where('ram.capacityGb = :capacityGb', { capacityGb })
          .andWhere('ram.memTypeId = :memTypeId', { memTypeId: memType.id });

        if (speedMts) {
          queryBuilder.andWhere('ram.speedMts = :speedMts', { speedMts });
        } else {
          queryBuilder.andWhere('ram.speedMts IS NULL');
        }

        const existing = await queryBuilder.getOne();

        if (existing) {
          // Detectar duplicado
          duplicados.push({
            fila: rowNum,
            capacidad: capacityGb,
            tipo: memTypeName,
            idExistente: existing.id,
            datos: {
              capacityGb,
              memTypeId: memType.id,
              speedMts,
              formFactorId,
              notes,
              isActive,
            }
          });
        } else {
          // Crear nuevo
          const newRam = this.assetRamOptionRepository.create({
            capacityGb,
            memTypeId: memType.id,
            speedMts,
            formFactorId,
            notes,
            isActive,
            createdBy: userId,
          });
          await this.assetRamOptionRepository.save(newRam);
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
        await this.assetRamOptionRepository.update(duplicate.idExistente, duplicate.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Error al actualizar RAM ${duplicate.capacidad}GB: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
