import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCpu } from '../entities/asset-cpu.entity';
import { CpuVendor } from '../entities/asset-cpu-vendor.entity';
import { CpuSegment } from '../entities/asset-cpu-segment.entity';
import { CreateAssetCpuDto } from './dto/asset-cpu.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetCpuService {
  constructor(
    @InjectRepository(AssetCpu)
    private readonly assetCpuRepository: Repository<AssetCpu>,
    @InjectRepository(CpuVendor)
    private readonly cpuVendorRepository: Repository<CpuVendor>,
    @InjectRepository(CpuSegment)
    private readonly cpuSegmentRepository: Repository<CpuSegment>,
  ) {}

  // Asset CPUs
  async getAssetCpus(vendorId?: number, segmentId?: number) {
    const queryBuilder = this.assetCpuRepository
      .createQueryBuilder('cpu')
      .leftJoinAndSelect('cpu.vendor', 'vendor')
      .leftJoinAndSelect('cpu.segment', 'segment')
      .leftJoinAndSelect('cpu.creator', 'creator')
      .leftJoinAndSelect('cpu.updater', 'updater');

    if (vendorId) {
      queryBuilder.andWhere('cpu.vendorId = :vendorId', { vendorId });
    }

    if (segmentId) {
      queryBuilder.andWhere('cpu.segmentId = :segmentId', { segmentId });
    }

    return await queryBuilder
      .orderBy('cpu.id', 'ASC')
      .getMany();
  }

  async getCpuVendors() {
    return await this.cpuVendorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getCpuSegments() {
    return await this.cpuSegmentRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createAssetCpu(data: CreateAssetCpuDto) {
    // Validar que el vendor existe
    const vendor = await this.cpuVendorRepository.findOne({ where: { id: data.vendorId } });
    if (!vendor) {
      throw new BadRequestException(`Vendor con ID ${data.vendorId} no encontrado`);
    }

    // Validar segment si se proporciona
    if (data.segmentId) {
      const segment = await this.cpuSegmentRepository.findOne({ where: { id: data.segmentId } });
      if (!segment) {
        throw new BadRequestException(`Segment con ID ${data.segmentId} no encontrado`);
      }
    }

    const assetCpu = this.assetCpuRepository.create(data);
    try {
      return await this.assetCpuRepository.save(assetCpu);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_cpus')) {
          throw new ConflictException('Ya existe un CPU con ese modelo para este fabricante');
        }
        throw new ConflictException('Ya existe un CPU con esos datos');
      }
      throw error;
    }
  }

  async getAssetCpuById(id: number) {
    return await this.assetCpuRepository.findOne({
      where: { id },
      relations: ['vendor', 'segment', 'creator', 'updater'],
    });
  }

  async updateAssetCpu(id: number, data: Partial<CreateAssetCpuDto>) {
    // Validar que el vendor existe si se proporciona
    if (data.vendorId) {
      const vendor = await this.cpuVendorRepository.findOne({ where: { id: data.vendorId } });
      if (!vendor) {
        throw new BadRequestException(`Vendor con ID ${data.vendorId} no encontrado`);
      }
    }

    // Validar segment si se proporciona
    if (data.segmentId) {
      const segment = await this.cpuSegmentRepository.findOne({ where: { id: data.segmentId } });
      if (!segment) {
        throw new BadRequestException(`Segment con ID ${data.segmentId} no encontrado`);
      }
    }

    try {
      await this.assetCpuRepository.update(id, data);
      return this.getAssetCpuById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_cpus')) {
          throw new ConflictException('Ya existe un CPU con ese modelo para este fabricante');
        }
        throw new ConflictException('Ya existe un CPU con esos datos');
      }
      throw error;
    }
  }

  // Exportar CPUs a Excel
  async exportToExcel(): Promise<Buffer> {
    const assetCpus = await this.assetCpuRepository.find({
      relations: ['vendor', 'segment'],
      order: { id: 'ASC' },
    });

    const data = assetCpus.map(cpu => ({
      'Vendor': cpu.vendor?.name || '',
      'Model': cpu.model,
      'Segment': cpu.segment?.name || '',
      'Cores': cpu.cores || '',
      'Threads': cpu.threads || '',
      'Base GHz': cpu.baseGhz || '',
      'Boost GHz': cpu.boostGhz || '',
      'Is Active': cpu.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CPUs');

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 8 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Generar plantilla de ejemplo para importación
  async generateTemplate(): Promise<Buffer> {
    const cpuVendors = await this.cpuVendorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const cpuSegments = await this.cpuSegmentRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const examples = [
      {
        'Vendor': 'Intel',
        'Model': 'Core i9-14900K',
        'Segment': 'Desktop',
        'Cores': '24',
        'Threads': '32',
        'Base GHz': '3.2',
        'Boost GHz': '6.0',
        'Is Active': 'Sí',
      },
      {
        'Vendor': 'AMD',
        'Model': 'Ryzen 9 7950X',
        'Segment': 'Desktop',
        'Cores': '16',
        'Threads': '32',
        'Base GHz': '4.5',
        'Boost GHz': '5.7',
        'Is Active': 'Sí',
      },
      {
        'Vendor': 'Apple',
        'Model': 'M4 Pro',
        'Segment': 'Mobile',
        'Cores': '12',
        'Threads': '12',
        'Base GHz': '3.5',
        'Boost GHz': '4.4',
        'Is Active': 'Sí',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CPUs');

    // Añadir hoja con vendors disponibles
    const vendorsData = cpuVendors.map(v => ({ 'Available Vendors': v.name }));
    const vendorsSheet = XLSX.utils.json_to_sheet(vendorsData);
    XLSX.utils.book_append_sheet(workbook, vendorsSheet, 'CPU Vendors');

    // Añadir hoja con segmentos disponibles
    const segmentsData = cpuSegments.map(s => ({ 'Available Segments': s.name }));
    const segmentsSheet = XLSX.utils.json_to_sheet(segmentsData);
    XLSX.utils.book_append_sheet(workbook, segmentsSheet, 'CPU Segments');

    worksheet['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
    vendorsSheet['!cols'] = [{ wch: 25 }];
    segmentsSheet['!cols'] = [{ wch: 25 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Importar CPUs desde Excel
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

    // Cargar todos los vendors y segments
    const cpuVendors = await this.cpuVendorRepository.find();
    const vendorMap = new Map(cpuVendors.map(v => [v.name.toLowerCase(), v]));

    const cpuSegments = await this.cpuSegmentRepository.find();
    const segmentMap = new Map(cpuSegments.map(s => [s.name.toLowerCase(), s]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header

      try {
        // Validar campos requeridos
        if (!row['Vendor'] || !row['Model']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (Vendor, Model)`);
          continue;
        }

        const vendorName = String(row['Vendor']).trim();
        const cpuVendor = vendorMap.get(vendorName.toLowerCase());

        if (!cpuVendor) {
          errores.push(`Fila ${rowNum}: Vendor "${vendorName}" no encontrado`);
          continue;
        }

        const model = String(row['Model']).trim();
        
        let segmentId = null;
        if (row['Segment']) {
          const segmentName = String(row['Segment']).trim();
          const cpuSegment = segmentMap.get(segmentName.toLowerCase());
          if (cpuSegment) {
            segmentId = cpuSegment.id;
          }
        }

        const cores = row['Cores'] ? parseInt(String(row['Cores'])) : null;
        const threads = row['Threads'] ? parseInt(String(row['Threads'])) : null;
        const baseGhz = row['Base GHz'] ? parseFloat(String(row['Base GHz'])) : null;
        const boostGhz = row['Boost GHz'] ? parseFloat(String(row['Boost GHz'])) : null;
        
        const isActiveStr = String(row['Is Active'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        // Buscar si ya existe (por vendor y modelo)
        const existing = await this.assetCpuRepository.findOne({
          where: { 
            vendorId: cpuVendor.id,
            model 
          },
        });

        if (existing) {
          // Detectar duplicado
          duplicados.push({
            fila: rowNum,
            vendor: vendorName,
            modelo: model,
            idExistente: existing.id,
            datos: {
              vendorId: cpuVendor.id,
              model,
              segmentId,
              cores,
              threads,
              baseGhz,
              boostGhz,
              isActive,
            }
          });
        } else {
          // Crear nuevo
          const newCpu = this.assetCpuRepository.create({
            vendorId: cpuVendor.id,
            model,
            segmentId,
            cores,
            threads,
            baseGhz,
            boostGhz,
            isActive,
            createdBy: userId,
          });
          await this.assetCpuRepository.save(newCpu);
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
        await this.assetCpuRepository.update(duplicate.idExistente, duplicate.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Error al actualizar CPU ${duplicate.modelo}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
