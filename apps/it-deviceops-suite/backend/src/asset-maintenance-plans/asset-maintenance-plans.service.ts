import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetMaintenancePlan } from '../entities/asset-maintenance-plan.entity';
import { AssetMaintenanceRecord } from '../entities/asset-maintenance-record.entity';
import { Holiday } from '../entities/holiday.entity';
import { CompleteAssetMaintenanceDto, CreateAssetMaintenancePlanDto, UpdateAssetMaintenancePlanDto } from './dto/asset-maintenance-plan.dto';
import * as XLSX from 'xlsx';

const pad2 = (value: number) => value.toString().padStart(2, '0');

const toDateOnlyString = (value: string | Date) => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0];
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
};

const parseDateOnly = (value: string | Date) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const dateValue = value.split('T')[0];
  return new Date(`${dateValue}T00:00:00`);
};

const addDaysToDateString = (dateString: string, days: number) => {
  const parsed = parseDateOnly(dateString);
  if (!parsed) return dateString;
  parsed.setDate(parsed.getDate() + days);
  return toDateOnlyString(parsed);
};

@Injectable()
export class AssetMaintenancePlansService {
  constructor(
    @InjectRepository(AssetMaintenancePlan)
    private readonly planRepository: Repository<AssetMaintenancePlan>,
    @InjectRepository(AssetMaintenanceRecord)
    private readonly recordRepository: Repository<AssetMaintenanceRecord>,
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  private async isHoliday(dateString: string) {
    return this.holidayRepository.findOne({
      where: { date: dateString, isActive: true },
      select: ['id'],
    });
  }

  private async adjustToBusinessDay(dateString: string) {
    let current = parseDateOnly(dateString);
    if (!current) return dateString;

    for (let i = 0; i < 31; i++) {
      const currentString = toDateOnlyString(current);
      const holiday = await this.isHoliday(currentString);
      if (holiday) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      const day = current.getDay();
      if (day === 6) {
        const previous = new Date(current);
        previous.setDate(previous.getDate() - 1);
        const previousString = toDateOnlyString(previous);
        const previousHoliday = await this.isHoliday(previousString);
        if (previousHoliday) {
          current.setDate(current.getDate() + 2);
        } else {
          current.setDate(current.getDate() - 1);
        }
        continue;
      }

      if (day === 0) {
        current.setDate(current.getDate() + 1);
        continue;
      }

      return currentString;
    }

    return toDateOnlyString(current);
  }

  async getAll(filters: {
    siteId?: number;
    assetId?: number;
    isActive?: boolean;
    from?: string;
    to?: string;
  }) {
    const { siteId, assetId, isActive, from, to } = filters;

    const query = this.planRepository
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.asset', 'asset')
      .leftJoinAndSelect('plan.site', 'site')
      .leftJoinAndSelect('plan.creator', 'creator')
      .leftJoinAndSelect('plan.updater', 'updater');

    if (siteId) query.andWhere('plan.siteId = :siteId', { siteId });
    if (assetId) query.andWhere('plan.assetId = :assetId', { assetId });
    if (isActive !== undefined) query.andWhere('plan.isActive = :isActive', { isActive });
    if (from) query.andWhere('plan.nextDueDate >= :from', { from });
    if (to) query.andWhere('plan.nextDueDate <= :to', { to });

    return query.orderBy('plan.nextDueDate', 'ASC').getMany();
  }

  async getById(id: number) {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['asset', 'site', 'creator', 'updater'],
    });

    if (!plan) {
      throw new NotFoundException('Plan de mantenimiento no encontrado');
    }

    return plan;
  }

  async create(dto: CreateAssetMaintenancePlanDto, userId: number) {
    const isRecurring = dto.isRecurring !== false;
    const frequencyDays = isRecurring ? dto.frequencyDays ?? null : null;
    const nextDueDate = await this.adjustToBusinessDay(toDateOnlyString(dto.nextDueDate));
    const plan = this.planRepository.create({
      ...dto,
      createdBy: userId,
      updatedBy: userId,
      isRecurring,
      frequencyDays,
      nextDueDate,
    });

    try {
      const saved = await this.planRepository.save(plan);
      return await this.getById(saved.id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un plan de mantenimiento con esos datos');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdateAssetMaintenancePlanDto, userId: number) {
    const plan = await this.getById(id);

    const { nextDueDate, lastDoneAt, ...rest } = dto;
    const updateData: Partial<AssetMaintenancePlan> = {
      ...rest,
      updatedBy: userId,
    };

    if (dto.isRecurring !== undefined) {
      updateData.isRecurring = dto.isRecurring;
      if (dto.isRecurring === false) {
        updateData.frequencyDays = null;
      }
    }

    if (dto.frequencyDays !== undefined) {
      updateData.frequencyDays = dto.frequencyDays;
    }

    if (nextDueDate) {
      updateData.nextDueDate = await this.adjustToBusinessDay(toDateOnlyString(nextDueDate));
    }

    if (lastDoneAt) {
      updateData.lastDoneAt = new Date(lastDoneAt);
    }

    try {
      await this.planRepository.update(plan.id, updateData);
      return this.getById(plan.id);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un plan de mantenimiento con esos datos');
      }
      throw error;
    }
  }

  async complete(planId: number, dto: CompleteAssetMaintenanceDto, userId: number) {
    const plan = await this.getById(planId);

    const performedAt = dto.performedAt ? new Date(dto.performedAt) : new Date();
    const scheduledDate = plan.nextDueDate ? toDateOnlyString(plan.nextDueDate) : undefined;

    const record = this.recordRepository.create({
      planId: plan.id,
      siteId: plan.siteId,
      assetId: plan.assetId,
      performedAt,
      scheduledDate,
      status: dto.status || 'completed',
      notes: dto.notes,
      incidents: dto.incidents,
      createdBy: userId,
    });

    try {
      await this.recordRepository.save(record);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('No se pudo registrar el mantenimiento');
      }
      throw error;
    }

    let nextDueDate: string | undefined;
    if (plan.isRecurring && plan.frequencyDays) {
      const performedDate = toDateOnlyString(performedAt);
      nextDueDate = addDaysToDateString(performedDate, plan.frequencyDays);
    }

    try {
      const updateData: Partial<AssetMaintenancePlan> = {
        lastDoneAt: performedAt,
        updatedBy: userId,
      };

      if (nextDueDate) {
        updateData.nextDueDate = nextDueDate;
      }

      if (!plan.isRecurring) {
        updateData.isActive = false;
      }

      await this.planRepository.update(plan.id, updateData);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('No se pudo actualizar el plan de mantenimiento');
      }
      throw error;
    }

    return {
      plan: await this.getById(plan.id),
      record,
    };
  }

  async exportToExcel(): Promise<Buffer> {
    const plans = await this.planRepository.find({
      relations: ['asset', 'site', 'creator'],
      order: { nextDueDate: 'ASC' },
    });

    const records = await this.recordRepository.find({
      relations: ['plan', 'asset', 'site', 'creator'],
      order: { performedAt: 'DESC' },
    });

    // Hoja 1: Planes de mantenimiento
    const plansFormatted = plans.map((plan) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = parseDateOnly(plan.nextDueDate);
      if (!dueDate) return null;
      dueDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'Programado';
      if (!plan.isActive) status = 'Inactivo';
      else if (diffDays < 0) status = 'Vencido';
      else if (diffDays <= 7) status = 'Próximo';

      return {
        'ID': plan.id,
        'Sitio': plan.site?.name || '-',
        'Asset Tag': plan.asset?.assetTag || '-',
        'Título': plan.title,
        'Tipo': plan.maintenanceType || '-',
        'Descripción': plan.description || '-',
        'Recurrente': plan.isRecurring ? 'Sí' : 'No',
        'Frecuencia (días)': plan.frequencyDays ?? '-',
        'Próximo Mantenimiento': plan.nextDueDate ? (parseDateOnly(plan.nextDueDate) || new Date(plan.nextDueDate)).toLocaleDateString('es-ES') : '-',
        'Último Realizado': plan.lastDoneAt ? new Date(plan.lastDoneAt).toLocaleDateString('es-ES') : '-',
        'Estado': status,
        'Días hasta/vencido': diffDays < 0 ? `+${Math.abs(diffDays)} días vencido` : `en ${diffDays} días`,
        'Activo': plan.isActive ? 'Sí' : 'No',
        'Creado por': plan.creator?.userName || '-',
        'Fecha Creación': plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('es-ES') : '-',
      };
    });

    const normalizedPlans = plansFormatted.filter((plan) => plan !== null);

    const plansWorksheet = XLSX.utils.json_to_sheet(normalizedPlans);
    plansWorksheet['!cols'] = [
      { wch: 8 },   // ID
      { wch: 20 },  // Sitio
      { wch: 15 },  // Activo
      { wch: 30 },  // Título
      { wch: 15 },  // Tipo
      { wch: 40 },  // Descripción
      { wch: 12 },  // Recurrente
      { wch: 15 },  // Frecuencia
      { wch: 18 },  // Próximo Mantenimiento
      { wch: 18 },  // Último Realizado
      { wch: 12 },  // Estado
      { wch: 20 },  // Días hasta/vencido
      { wch: 10 },  // Activo
      { wch: 15 },  // Creado por
      { wch: 15 },  // Fecha Creación
    ];

    // Hoja 2: Historial de mantenimientos realizados
    const recordsFormatted = records.map((record) => ({
      'ID': record.id,
      'Plan ID': record.planId,
      'Plan': record.plan?.title || '-',
      'Sitio': record.site?.name || '-',
      'Asset Tag': record.asset?.assetTag || '-',
      'Fecha Planificada': record.scheduledDate ? (parseDateOnly(record.scheduledDate) || new Date(record.scheduledDate)).toLocaleDateString('es-ES') : '-',
      'Fecha Realizado': record.performedAt ? new Date(record.performedAt).toLocaleDateString('es-ES') : '-',
      'Estado': record.status,
      'Notas': record.notes || '-',
      'Incidencias': record.incidents || '-',
      'Realizado por': record.creator?.userName || '-',
      'Fecha Registro': record.createdAt ? new Date(record.createdAt).toLocaleDateString('es-ES') : '-',
    }));

    const recordsWorksheet = XLSX.utils.json_to_sheet(recordsFormatted);
    recordsWorksheet['!cols'] = [
      { wch: 8 },   // ID
      { wch: 10 },  // Plan ID
      { wch: 30 },  // Plan
      { wch: 20 },  // Sitio
      { wch: 15 },  // Activo
      { wch: 18 },  // Fecha Planificada
      { wch: 18 },  // Fecha Realizado
      { wch: 12 },  // Estado
      { wch: 40 },  // Notas
      { wch: 40 },  // Incidencias
      { wch: 15 },  // Realizado por
      { wch: 15 },  // Fecha Registro
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, plansWorksheet, 'Planes de Mantenimiento');
    XLSX.utils.book_append_sheet(workbook, recordsWorksheet, 'Historial Realizados');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async duplicate(id: number, userId: number) {
    const original = await this.getById(id);

    const dto: CreateAssetMaintenancePlanDto = {
      siteId: original.siteId,
      assetId: original.assetId,
      title: `${original.title} (Copia)`,
      maintenanceType: original.maintenanceType,
      priority: original.priority,
      description: original.description,
      isRecurring: original.isRecurring,
      frequencyDays: original.frequencyDays ?? undefined,
      nextDueDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    return this.create(dto, userId);
  }

  async generateTemplate(): Promise<Buffer> {
    const examples = [
      {
        'Site ID': 1,
        'Asset ID': 10,
        'Título': 'Limpieza general',
        'Tipo': 'Preventivo',
        'Prioridad': 'media',
        'Descripción': 'Limpieza de componentes y verificación',
        'Recurrente': 'Sí',
        'Frecuencia (días)': 30,
        'Próxima Fecha (YYYY-MM-DD)': '2026-03-01',
        'Activo': 'Sí',
      },
      {
        'Site ID': 1,
        'Asset ID': 11,
        'Título': 'Check hardware',
        'Tipo': 'Inspección',
        'Prioridad': 'alta',
        'Descripción': 'Revisión de componentes críticos',
        'Recurrente': 'Sí',
        'Frecuencia (días)': 15,
        'Próxima Fecha (YYYY-MM-DD)': '2026-02-20',
        'Activo': 'Sí',
      },
      {
        'Site ID': 1,
        'Asset ID': 12,
        'Título': 'Actualización firmware',
        'Tipo': 'Correctivo',
        'Prioridad': 'critica',
        'Descripción': 'Actualización de firmware del dispositivo',
        'Recurrente': 'No',
        'Frecuencia (días)': '',
        'Próxima Fecha (YYYY-MM-DD)': '2026-05-01',
        'Activo': 'Sí',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Planes de Mantenimiento');

    worksheet['!cols'] = [
      { wch: 10 }, // Site ID
      { wch: 10 }, // Asset ID
      { wch: 30 }, // Título
      { wch: 15 }, // Tipo
      { wch: 12 }, // Prioridad
      { wch: 40 }, // Descripción
      { wch: 12 }, // Recurrente
      { wch: 18 }, // Frecuencia
      { wch: 25 }, // Próxima Fecha
      { wch: 10 }, // Activo
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: any[], userId: number): Promise<{ insertados: number; duplicados: any[]; errores: string[] }> {
    const errores: string[] = [];
    const duplicados: any[] = [];
    let insertados = 0;

    for (let i = 0; i < buffer.length; i++) {
      const row = buffer[i];
      const rowNum = i + 2;

      try {
        if (!row['Site ID'] || !row['Asset ID'] || !row['Título']) {
          errores.push(`Fila ${rowNum}: Faltan campos obligatorios (Site ID, Asset ID, Título)`);
          continue;
        }

        const siteId = parseInt(String(row['Site ID']));
        const assetId = parseInt(String(row['Asset ID']));
        const title = String(row['Título']).trim();
        const maintenanceType = row['Tipo'] ? String(row['Tipo']).trim() : undefined;
        const priority = row['Prioridad'] ? String(row['Prioridad']).trim().toLowerCase() : 'media';
        const description = row['Descripción'] ? String(row['Descripción']).trim() : undefined;
        const recurrenteStr = row['Recurrente'] ? String(row['Recurrente']).trim().toLowerCase() : 'sí';
        const isRecurring = !(recurrenteStr === 'no' || recurrenteStr === 'false' || recurrenteStr === '0');
        const frequencyDays = isRecurring
          ? parseInt(String(row['Frecuencia (días)'] || 30))
          : null;
        if (isRecurring && (!frequencyDays || Number.isNaN(frequencyDays))) {
          errores.push(`Fila ${rowNum}: Frecuencia inválida`);
          continue;
        }
        const nextDueDate = row['Próxima Fecha (YYYY-MM-DD)'] ? String(row['Próxima Fecha (YYYY-MM-DD)']).trim() : new Date().toISOString().split('T')[0];
        const adjustedNextDueDate = await this.adjustToBusinessDay(toDateOnlyString(nextDueDate));
        const isActiveStr = String(row['Activo'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.planRepository.findOne({
          where: { siteId, assetId, title },
        });

        if (existing) {
          duplicados.push({
            fila: rowNum,
            titulo: title,
            assetId,
            idExistente: existing.id,
            datos: {
              maintenanceType,
              priority,
              description,
              isRecurring,
              frequencyDays,
              nextDueDate: adjustedNextDueDate,
              isActive,
              updatedBy: userId,
            },
          });
        } else {
          const newPlan = this.planRepository.create({
            siteId,
            assetId,
            title,
            maintenanceType,
            priority,
            description,
            frequencyDays,
            isRecurring,
            nextDueDate: adjustedNextDueDate,
            isActive,
            createdBy: userId,
            updatedBy: userId,
          });

          await this.planRepository.save(newPlan);
          insertados++;
        }
      } catch (error: any) {
        errores.push(`Fila ${rowNum}: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }

  async updateDuplicatesFromExcel(duplicates: any[], userId: number): Promise<number> {
    let actualizados = 0;

    for (const dup of duplicates) {
      try {
        const adjustedNextDueDate = await this.adjustToBusinessDay(toDateOnlyString(dup.datos.nextDueDate));
        await this.planRepository.update(dup.idExistente, {
          ...dup.datos,
          nextDueDate: adjustedNextDueDate,
        });
        actualizados++;
      } catch (error) {
        console.error(`Error actualizando plan ${dup.idExistente}:`, error);
      }
    }

    return actualizados;
  }

  async applyToMultipleAssets(planId: number, assetIds: number[], userId: number) {
    const originalPlan = await this.getById(planId);
    const results = [];

    for (const assetId of assetIds) {
      try {
        const dto: CreateAssetMaintenancePlanDto = {
          siteId: originalPlan.siteId,
          assetId,
          title: originalPlan.title,
          maintenanceType: originalPlan.maintenanceType,
          description: originalPlan.description,
          priority: originalPlan.priority,
          isRecurring: originalPlan.isRecurring,
          frequencyDays: originalPlan.frequencyDays ?? undefined,
          nextDueDate: toDateOnlyString(originalPlan.nextDueDate),
          isActive: originalPlan.isActive,
        };

        const newPlan = await this.create(dto, userId);
        results.push(newPlan);
      } catch (error) {
        console.error(`Error aplicando plan a asset ${assetId}:`, error);
      }
    }

    return results;
  }
}
