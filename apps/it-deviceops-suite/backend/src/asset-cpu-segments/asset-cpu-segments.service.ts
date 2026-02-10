import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CpuSegment } from '../entities/asset-cpu-segment.entity';
import { CreateCpuSegmentDto, UpdateCpuSegmentDto } from './dto/cpu-segment.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetCpuSegmentsService {
  constructor(
    @InjectRepository(CpuSegment)
    private segmentRepository: Repository<CpuSegment>,
  ) {}

  async getAll(): Promise<CpuSegment[]> {
    return this.segmentRepository.find({
      relations: ['creator', 'updater'],
      order: { code: 'ASC' },
    });
  }

  async getById(id: number): Promise<CpuSegment> {
    const segment = await this.segmentRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!segment) {
      throw new NotFoundException(`Segmento de CPU con ID ${id} no encontrado`);
    }

    return segment;
  }

  async create(dto: CreateCpuSegmentDto, userId: number): Promise<CpuSegment> {
    const segment = this.segmentRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
    });

    try {
      return await this.segmentRepository.save(segment);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un segmento de CPU con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateCpuSegmentDto, userId: number): Promise<CpuSegment> {
    const segment = await this.getById(id);

    Object.assign(segment, dto);
    segment.updatedBy = userId;

    try {
      return await this.segmentRepository.save(segment);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException(`Ya existe un segmento de CPU con el código "${dto.code}"`);
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const segments = await this.getAll();

    const data = segments.map((segment) => ({
      ID: segment.id,
      Código: segment.code,
      Nombre: segment.name,
      Estado: segment.isActive ? 'Activo' : 'Inactivo',
      'Creado por': segment.creator?.userName || '',
      'Fecha creación': segment.createdAt,
      'Modificado por': segment.updater?.userName || '',
      'Fecha modificación': segment.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Segmentos CPU');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const data = [
      {
        Código: 'DESKTOP',
        Nombre: 'Desktop',
        Estado: 'Activo',
      },
      {
        Código: 'MOBILE',
        Nombre: 'Mobile',
        Estado: 'Activo',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Segmentos CPU');

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

        const existingSegment = await this.segmentRepository.findOne({ where: { code } });

        if (existingSegment) {
          duplicados.push(rowData);
        } else {
          const segment = this.segmentRepository.create({
            code,
            name,
            isActive: estado === 'Activo' || estado === 'activo',
            createdBy: userId,
            updatedBy: userId,
          });

          await this.segmentRepository.save(segment);
          insertados.push(segment);
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
      const segment = await this.segmentRepository.findOne({ where: { code } });

      if (segment) {
        segment.name = duplicate['Nombre'];
        segment.isActive = duplicate['Estado'] === 'Activo' || duplicate['Estado'] === 'activo';
        segment.updatedBy = userId;

        await this.segmentRepository.save(segment);
        actualizados++;
      }
    }

    return { actualizados };
  }
}
