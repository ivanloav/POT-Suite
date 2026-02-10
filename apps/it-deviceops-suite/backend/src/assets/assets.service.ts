import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { AssetCpu } from '../entities/asset-cpu.entity';
import { AssetRamOption } from '../entities/asset-ram-option.entity';
import { StorageOption } from '../entities/storage-option.entity';
import { AssetRamMemoryType } from '../entities/asset-ram-memory-type.entity';
import { AssetRamFormFactor } from '../entities/asset-ram-form-factor.entity';
import { AssetStatus } from '../entities/asset-status.entity';
import { CreateAssetDto, UpdateAssetDto, RetireAssetDto } from './dto/asset.dto';
import { AssignmentsService } from '../assignments/assignments.service';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetStatus)
    private readonly assetStatusRepository: Repository<AssetStatus>,
    @InjectRepository(AssetCpu)
    private readonly cpuRepository: Repository<AssetCpu>,
    @InjectRepository(AssetRamOption)
    private readonly ramRepository: Repository<AssetRamOption>,
    @InjectRepository(StorageOption)
    private readonly storageRepository: Repository<StorageOption>,
    @InjectRepository(AssetRamMemoryType)
    private readonly ramMemTypeRepository: Repository<AssetRamMemoryType>,
    @InjectRepository(AssetRamFormFactor)
    private readonly ramFormFactorRepository: Repository<AssetRamFormFactor>,
    private readonly assignmentsService: AssignmentsService,
  ) {}

  // Convierte snake_case y "Space Case" a camelCase
  private snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.snakeToCamel(v));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        // Convertir a lowercase primero para evitar problemas con "ID" → "iD"
        const lowerKey = key.toLowerCase();
        const camelKey = lowerKey
          .replace(/\s+(.)/g, (_, g) => g.toUpperCase()) // Espacios a camelCase
          .replace(/_(.)/g, (_, g) => g.toUpperCase()); // Guiones bajos a camelCase
        
        acc[camelKey] = this.snakeToCamel(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  }

  // Convierte número serial de Excel a fecha YYYY-MM-DD
  private excelSerialToDate(serial: number): string {
    const excelEpoch = new Date(1899, 11, 30);
    const millisecondsPerDay = 86400000;
    const date = new Date(excelEpoch.getTime() + (serial * millisecondsPerDay));
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // Normaliza fechas: convierte seriales de Excel, strings ISO, o undefined
  private normalizeDate(val: any): string | undefined {
    if (!val || val === '') return undefined;
    
    // Si es un número, asumimos que es un serial de Excel
    if (typeof val === 'number') {
      return this.excelSerialToDate(val);
    }
    
    // Si es un string con formato de fecha válido
    if (typeof val === 'string') {
      // Si ya está en formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return val;
      }
      // Intentar parsear otras formas
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return undefined;
  }

  // Buscar RAM por campos descriptivos (capacidad, tipo, velocidad, form factor)
  private async findRamByDescription(capacityGb: number, memTypeCode: string, speedMts?: number, formFactorCode?: string): Promise<number | null> {
    try {
      // Buscar el tipo de memoria por código
      const memType = await this.ramMemTypeRepository.findOne({ where: { code: memTypeCode.toLowerCase() } });
      if (!memType) return null;

      const where: any = {
        capacityGb: capacityGb,
        memTypeId: memType.id,
      };

      // Si tiene velocidad, agregarla al filtro
      if (speedMts !== undefined && speedMts !== null) {
        where.speedMts = speedMts;
      }

      // Si tiene form factor, buscarlo y agregarlo
      if (formFactorCode) {
        const formFactor = await this.ramFormFactorRepository.findOne({ where: { code: formFactorCode.toLowerCase() } });
        if (formFactor) {
          where.formFactorId = formFactor.id;
        }
      }

      const ramOption = await this.ramRepository.findOne({ where });
      return ramOption?.id || null;
    } catch (error) {
      console.error('Error buscando RAM por descripción:', error);
      return null;
    }
  }

  // Buscar CPU por campos descriptivos (vendor, modelo)
  private async findCpuByDescription(vendorCode: string, model: string): Promise<number | null> {
    try {
      const cpu = await this.cpuRepository
        .createQueryBuilder('cpu')
        .innerJoin('cpu.vendor', 'vendor')
        .where('LOWER(vendor.code) = :vendorCode', { vendorCode: vendorCode.toLowerCase() })
        .andWhere('LOWER(cpu.model) = :model', { model: model.toLowerCase() })
        .getOne();
      
      return cpu?.id || null;
    } catch (error) {
      console.error('Error buscando CPU por descripción:', error);
      return null;
    }
  }

  // Buscar Storage por campos descriptivos (capacidad, tipo, interface, form factor)
  private async findStorageByDescription(capacityGb: number, driveTypeCode: string, interfaceCode?: string, formFactorCode?: string): Promise<number | null> {
    try {
      const query = this.storageRepository
        .createQueryBuilder('storage')
        .innerJoin('storage.driveType', 'driveType')
        .where('storage.capacity_gb = :capacityGb', { capacityGb })
        .andWhere('LOWER(driveType.code) = :driveTypeCode', { driveTypeCode: driveTypeCode.toLowerCase() });

      if (interfaceCode) {
        query
          .innerJoin('storage.interface', 'interface')
          .andWhere('LOWER(interface.code) = :interfaceCode', { interfaceCode: interfaceCode.toLowerCase() });
      }

      if (formFactorCode) {
        query
          .innerJoin('storage.formFactor', 'formFactor')
          .andWhere('LOWER(formFactor.code) = :formFactorCode', { formFactorCode: formFactorCode.toLowerCase() });
      }

      const storageOption = await query.getOne();
      return storageOption?.id || null;
    } catch (error) {
      console.error('Error buscando Storage por descripción:', error);
      return null;
    }
  }

  // Helper: convertir valores a número solo si es válido, sino undefined
  private safeNumber(val: any): number | undefined {
    if (val === null || val === undefined || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }

  async importFromExcel(assets: any[], userId: number) {
    const createdAssets = [];
    const updatedAssets = [];
    const errors = [];
    const duplicates = [];
    
    for (const [index, assetDataOriginal] of assets.entries()) {
      // Permitir snake_case y camelCase
      const assetData = this.snakeToCamel(assetDataOriginal);
      
      try {
        // Validar campos requeridos
        if (!assetData.siteId || !assetData.assetTag || !assetData.typeId) {
          errors.push({ row: index + 2, error: 'Faltan campos requeridos (siteId, assetTag, typeId)' });
          continue;
        }
        
        // Verificar si ya existe el activo
        const existingAsset = await this.assetRepository.findOne({
          where: {
            siteId: Number(assetData.siteId),
            assetTag: assetData.assetTag,
          },
        });
        
        // Determinar statusId automáticamente si no se proporciona
        let statusId = this.safeNumber(assetData.statusId);
        if (!statusId) {
          // Si tiene empleado asignado → Asignado (2), sino → En Stock (1)
          statusId = assetData.employeeId ? 2 : 1;
        }

        // ========== BÚSQUEDA POR CAMPOS DESCRIPTIVOS ==========

        // CPU: Buscar por campos descriptivos
        let cpuId: number | undefined = undefined;
        if (assetData.cpuVendor && assetData.cpuModel) {
          cpuId = await this.findCpuByDescription(assetData.cpuVendor, assetData.cpuModel) || undefined;
          if (!cpuId) {
            errors.push({ row: index + 2, error: `CPU no encontrado: ${assetData.cpuVendor} ${assetData.cpuModel}` });
          }
        }

        // RAM: Buscar por campos descriptivos
        let ramId: number | undefined = undefined;
        if (assetData.ramCapacityGb && assetData.ramMemType) {
          ramId = (await this.findRamByDescription(
            this.safeNumber(assetData.ramCapacityGb)!,
            assetData.ramMemType,
            this.safeNumber(assetData.ramSpeedMts),
            assetData.ramFormFactor
          )) || undefined;
          if (!ramId) {
            errors.push({ 
              row: index + 2, 
              error: `RAM no encontrada: ${assetData.ramCapacityGb}GB ${assetData.ramMemType} ${assetData.ramSpeedMts || ''}`.trim() 
            });
          }
        }

        // Storage: Buscar por campos descriptivos
        let storageId: number | undefined = undefined;
        if (assetData.storageCapacityGb && assetData.storageDriveType) {
          storageId = (await this.findStorageByDescription(
            this.safeNumber(assetData.storageCapacityGb)!,
            assetData.storageDriveType,
            assetData.storageInterface,
            assetData.storageFormFactor
          )) || undefined;
          if (!storageId) {
            errors.push({ 
              row: index + 2, 
              error: `Storage no encontrado: ${assetData.storageCapacityGb}GB ${assetData.storageDriveType}`.trim() 
            });
          }
        }
        
        const dto = {
          siteId: Number(assetData.siteId),
          assetTag: assetData.assetTag,
          typeId: Number(assetData.typeId),
          employeeId: this.safeNumber(assetData.employeeId),
          sectionId: this.safeNumber(assetData.sectionId),
          modelId: this.safeNumber(assetData.modelId),
          osVersionId: this.safeNumber(assetData.osVersionId),
          cpuId,
          ramId,
          storageId,
          serial: assetData.serial,
          imei: assetData.imei,
          macAddress: assetData.macAddress,
          ipAddress: assetData.ipAddress,
          uuid: assetData.uuid,
          statusId: statusId,
          purchaseDate: this.normalizeDate(assetData.purchaseDate),
          warrantyEnd: this.normalizeDate(assetData.warrantyEnd),
          location: assetData.location,
          notes: assetData.notes,
        };
        
        if (existingAsset) {
          // Si existe, agregarlo a la lista de duplicados
          duplicates.push({
            row: index + 2,
            assetTag: assetData.assetTag,
            existingId: existingAsset.id,
            data: dto,
          });
        } else {
          // Si no existe, crear nuevo
          const created = await this.create(dto, userId);
          createdAssets.push(created);

          // La asignación ya se crea automáticamente en el método create()
        }
      } catch (err) {
        let errorMsg = '';
        if (typeof err === 'object' && err !== null) {
          const error = err as any;
          
          // Mensajes de error específicos para PostgreSQL
          if (error.code === '23505') {
            // Violación de constraint único
            if (error.detail) {
              const match = error.detail.match(/Key \(([^)]+)\)=\(([^)]+)\)/);
              if (match) {
                const field = match[1];
                const value = match[2];
                errorMsg = `El campo ${field} con valor "${value}" ya existe`;
              } else {
                errorMsg = 'Valor duplicado detectado';
              }
            } else {
              errorMsg = 'Valor duplicado detectado';
            }
          } else if (error.code === 'P0001') {
            // Error de trigger personalizado (como enforce_asset_model_type)
            if (error.message) {
              errorMsg = error.message;
            } else {
              errorMsg = 'Error de validación en la base de datos';
            }
          } else if (error.message) {
            errorMsg = error.message;
          } else {
            errorMsg = String(err);
          }
        } else {
          errorMsg = String(err);
        }
        errors.push({ row: index + 2, error: errorMsg });
      }
    }
    // eslint-disable-next-line no-console
    console.log('Importación de Excel:', {
      total: assets.length,
      insertados: createdAssets.length,
      actualizados: updatedAssets.length,
      duplicados: duplicates.length,
      errores: errors.length,
    });
    
    return {
      insertados: createdAssets.length,
      actualizados: updatedAssets.length,
      duplicados: duplicates,
      errores: errors,
      datos: createdAssets,
    };
  }

  async updateDuplicatesFromExcel(duplicates: any[], userId: number) {
    const updatedAssets = [];
    const errors = [];
    
    for (const duplicate of duplicates) {
      try {
        const updated = await this.update(duplicate.existingId, duplicate.data, userId);
        updatedAssets.push(updated);
      } catch (err) {
        let errorMsg = '';
        if (typeof err === 'object' && err !== null && 'message' in err) {
          errorMsg = (err as any).message;
        } else {
          errorMsg = String(err);
        }
        errors.push({
          row: duplicate.row,
          assetTag: duplicate.assetTag,
          error: errorMsg,
        });
      }
    }
    
    return {
      actualizados: updatedAssets.length,
      errores: errors,
      datos: updatedAssets,
    };
  }

  async findAll(filters?: {
    status?: number;
    typeId?: number;
    sectionId?: number;
    sectionName?: string;
    siteId?: number;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const whereConditions: any = {};
    if (filters?.siteId) {
      whereConditions.siteId = filters.siteId;
    }
    if (filters?.status) {
      whereConditions.status = filters.status;
    }
    if (filters?.typeId) {
      whereConditions.typeId = filters.typeId;
    }
    if (filters?.sectionId) {
      whereConditions.sectionId = filters.sectionId;
    }

    // Crear query builder para manejar filtro por nombre de sección
    const queryBuilder = this.assetRepository.createQueryBuilder('asset')
      .leftJoinAndSelect('asset.type', 'type')
      .leftJoinAndSelect('asset.section', 'section')
      .leftJoinAndSelect('asset.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand')
      .leftJoinAndSelect('asset.osVersion', 'osVersion')
      .leftJoinAndSelect('osVersion.osFamily', 'osFamily')
      .leftJoinAndSelect('asset.cpu', 'cpu')
      .leftJoinAndSelect('cpu.vendor', 'cpuVendor')
      .leftJoinAndSelect('cpu.segment', 'cpuSegment')
      .leftJoinAndSelect('asset.ram', 'ram')
      .leftJoinAndSelect('ram.memType', 'ramMemType')
      .leftJoinAndSelect('ram.formFactor', 'ramFormFactor')
      .leftJoinAndSelect('asset.storage', 'storage')
      .leftJoinAndSelect('storage.driveType', 'storageDriveType')
      .leftJoinAndSelect('storage.interface', 'storageInterface')
      .leftJoinAndSelect('storage.formFactor', 'storageFormFactor')
      .leftJoinAndSelect('asset.site', 'site')
      .leftJoinAndSelect('asset.employee', 'employee')
      .leftJoinAndSelect('asset.status', 'status')
      .leftJoinAndSelect('asset.creator', 'creator')
      .leftJoinAndSelect('asset.updater', 'updater')
      .orderBy('asset.id', 'DESC')
      .skip(skip)
      .take(limit);

    // Aplicar whereConditions
    Object.keys(whereConditions).forEach(key => {
      queryBuilder.andWhere(`asset.${key} = :${key}`, { [key]: whereConditions[key] });
    });

    // Filtro especial por nombre de sección (cuando no hay site seleccionado)
    if (filters?.sectionName && !filters?.sectionId) {
      queryBuilder.andWhere('section.name = :sectionName', { sectionName: filters.sectionName });
    }

    const [assets, total] = await queryBuilder.getManyAndCount();


    const assetsWithAssignments = await Promise.all(
      assets.map(async (asset) => {
        const currentAssignment = await this.assetRepository.manager
          .getRepository('asset_assignments')
          .createQueryBuilder('aa')
          .leftJoinAndSelect('aa.employee', 'employee')
          .where('aa.asset_id = :assetId', { assetId: asset.id })
          .andWhere('aa.returned_at IS NULL')
          .getOne();

        return {
          ...asset,
          current_assignment: currentAssignment || null,
        };
      })
    );

    return {
      data: assetsWithAssignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: [
        'type',
        'section',
        'model',
        'model.brand',
        'osVersion',
        'osVersion.osFamily',
        'cpu',
        'cpu.vendor',
        'cpu.segment',
        'ram',
        'ram.memType',
        'ram.formFactor',
        'storage',
        'storage.driveType',
        'storage.interface',
        'storage.formFactor',
        'status',
        'creator',
        'updater',
        'assignments',
        'assignments.employee',
      ],
    });

    if (!asset) {
      throw new Error('Activo no encontrado');
    }

    return asset;
  }

  private sanitizeEmptyStrings(data: any): any {
    // Convertir strings vacíos a null para evitar conflictos con restricciones de unicidad
    const sanitized = { ...data };
    const fieldsToSanitize = ['serial', 'imei', 'macAddress', 'ipAddress', 'uuid', 'location', 'notes'];
    
    fieldsToSanitize.forEach(field => {
      if (sanitized[field] === '' || sanitized[field] === '0') {
        sanitized[field] = null;
      }
    });
    
    return sanitized;
  }

  async create(data: CreateAssetDto, userId: number) {
    const sanitizedData = this.sanitizeEmptyStrings(data);
    const asset = this.assetRepository.create({
      ...sanitizedData,
      createdBy: userId,
    });

    try {
      const savedAsset = await this.assetRepository.save(asset) as unknown as Asset;

      // Si el activo tiene employeeId, crear asignación automáticamente
      if (data.employeeId) {
        try {
          await this.assignmentsService.create({
            siteId: data.siteId,
            assetId: savedAsset.id,
            employeeId: data.employeeId,
            assignedAt: new Date().toISOString(),
          }, userId);
        } catch (error) {
          // Compensación: eliminar activo creado si falla la asignación
          try {
            await this.assetRepository.remove(savedAsset);
          } catch (cleanupError) {
            console.error('Error revirtiendo activo tras fallo de asignación:', cleanupError);
          }
          console.error('Error creando asignación automática:', error);
          throw new InternalServerErrorException('No se pudo crear la asignación del activo');
        }
      }

      return savedAsset;
    } catch (error: any) {
      // Manejar errores de constraint UNIQUE de PostgreSQL
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_assets_site_tag')) {
          throw new ConflictException(`Ya existe un activo con la etiqueta "${data.assetTag}" en este sitio`);
        } else if (constraintName?.includes('ux_assets_site_serial')) {
          throw new ConflictException(`Ya existe un activo con el número de serie "${data.serial}" en este sitio`);
        } else if (constraintName?.includes('ux_assets_site_imei')) {
          throw new ConflictException(`Ya existe un activo con el IMEI "${data.imei}" en este sitio`);
        } else {
          throw new ConflictException('Ya existe un activo con los mismos datos únicos');
        }
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateAssetDto, userId: number) {
    const asset = await this.assetRepository.findOne({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Activo no encontrado');
    }

    const sanitizedData = this.sanitizeEmptyStrings(data);
    
    Object.assign(asset, {
      ...sanitizedData,
      updatedBy: userId,
    });

    try {
      const result = await this.assetRepository.save(asset);
      return result;
    } catch (error: any) {
      // Manejar errores de constraint UNIQUE de PostgreSQL
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_assets_site_tag')) {
          throw new ConflictException(`Ya existe un activo con la etiqueta "${data.assetTag}" en este sitio`);
        } else if (constraintName?.includes('ux_assets_site_serial')) {
          throw new ConflictException(`Ya existe un activo con el número de serie "${data.serial}" en este sitio`);
        } else if (constraintName?.includes('ux_assets_site_imei')) {
          throw new ConflictException(`Ya existe un activo con el IMEI "${data.imei}" en este sitio`);
        } else {
          throw new ConflictException('Ya existe un activo con los mismos datos únicos');
        }
      }
      throw error;
    }
  }

  async retire(id: number, data: RetireAssetDto, userId: number) {
    const asset = await this.findOne(id);

    const retiredStatus = await this.assetStatusRepository.findOne({
      where: { code: 'retired', isActive: true },
    });
    if (!retiredStatus) {
      throw new NotFoundException('Estado "retired" no encontrado');
    }

    asset.statusId = retiredStatus.id;
    asset.retiredAt = new Date();
    if (data.reason) {
      asset.retiredReason = data.reason;
    }
    asset.updatedBy = userId;

    return await this.assetRepository.save(asset);
  }

  async delete(id: number) {
    const asset = await this.findOne(id);
    return await this.assetRepository.remove(asset);
  }

  // Generar plantilla de ejemplo para importación de activos
  async generateTemplate(): Promise<Buffer> {
    // Ejemplos con comentarios - IMPORTANTE: Puedes usar IDs O campos descriptivos
    const examples = [
      {
        'Site ID': '⚠️ REQUERIDO: CONSULTAR SELECTOR DE SEDE',
        'Asset Tag': 'LAP-001',
        'Type ID': '⚠️ REQUERIDO: CONSULTAR CATÁLOGOS',
        'Employee ID': '⚠️ ID del empleado (si está asignado)',
        'Section ID': '⚠️ ID de sección/departamento',
        'Model ID': '⚠️ DEBE PERTENECER AL TYPE SELECCIONADO',
        'OS Version ID': '⚠️ CONSULTAR CATÁLOGOS > S.O.',
        
        'CPU Vendor': 'intel',
        'CPU Model': 'Core i7-1355U',
        'RAM Capacity GB': '16',
        'RAM Mem Type': 'ddr5',
        'RAM Speed MTS': '5600',
        'RAM Form Factor': 'sodimm',
        'Storage Capacity GB': '512',
        'Storage Drive Type': 'ssd',
        'Storage Interface': 'nvme',
        'Storage Form Factor': 'm2',
        
        'Serial': 'SN123456789',
        'IMEI': undefined,
        'MAC Address': '00:1A:2B:3C:4D:5E',
        'IP Address': '192.168.1.100',
        'UUID': undefined,
        'Status ID': '1 = Stock, 2 = Asignado, 3 = Reparación, 4 = Retirado',
        'Purchase Date': '2024-01-15',
        'Warranty End': '2027-01-15',
        'Location': 'Oficina Principal',
        'Notes': 'EJEMPLO con campos descriptivos',
      },
      {
        'Site ID': undefined,
        'Asset Tag': 'MBP-002',
        'Type ID': undefined,
        'Employee ID': undefined,
        'Section ID': undefined,
        'Model ID': undefined,
        'OS Version ID': undefined,
        'CPU Vendor': 'apple',
        'CPU Model': 'M3 Max',
        'RAM Capacity GB': 36,
        'RAM Mem Type': 'unified',
        'RAM Speed MTS': undefined,
        'RAM Form Factor': 'onboard',
        'Storage Capacity GB': 1000,
        'Storage Drive Type': 'ssd',
        'Storage Interface': 'nvme',
        'Storage Form Factor': undefined,
        'Serial': 'C02ABC123XYZ',
        'IMEI': undefined,
        'MAC Address': 'A1:B2:C3:D4:E5:F6',
        'IP Address': undefined,
        'UUID': undefined,
        'Status ID': 2,
        'Purchase Date': '2024-02-20',
        'Warranty End': '2027-02-20',
        'Location': 'Depto. Diseño',
        'Notes': 'EJEMPLO: MacBook Pro con memoria unificada',
      },
      {
        'Site ID': undefined,
        'Asset Tag': 'MOB-003',
        'Type ID': undefined,
        'Employee ID': undefined,
        'Section ID': undefined,
        'Model ID': undefined,
        'OS Version ID': undefined,
        'CPU Vendor': undefined,
        'CPU Model': undefined,
        'RAM Capacity GB': undefined,
        'RAM Mem Type': undefined,
        'RAM Speed MTS': undefined,
        'RAM Form Factor': undefined,
        'Storage Capacity GB': undefined,
        'Storage Drive Type': undefined,
        'Storage Interface': undefined,
        'Storage Form Factor': undefined,
        'Serial': undefined,
        'IMEI': '123456789012345',
        'MAC Address': undefined,
        'IP Address': undefined,
        'UUID': undefined,
        'Status ID': 2,
        'Purchase Date': '2024-03-10',
        'Warranty End': '2026-03-10',
        'Location': 'Asignado a empleado',
        'Notes': 'EJEMPLO: iPhone (móvil sin CPU/RAM/Storage)',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

    // Añadir hoja con instrucciones
    const instructions = [
      { Field: 'Site ID', Required: 'Yes', Description: 'ID de la sede (número)' },
      { Field: 'Asset Tag', Required: 'Yes', Description: 'Etiqueta única del activo' },
      { Field: 'Type ID', Required: 'Yes', Description: 'ID del tipo de activo (consultar catálogo)' },
      { Field: 'Employee ID', Required: 'No', Description: 'ID del empleado asignado' },
      { Field: 'Section ID', Required: 'No', Description: 'ID de la sección/ubicación' },
      { Field: 'Model ID', Required: 'No', Description: 'ID del modelo - DEBE pertenecer al Type ID' },
      { Field: 'OS Version ID', Required: 'No', Description: 'ID de la versión del S.O.' },
      
      { Field: '--- COMPONENTES HW ---', Required: '', Description: 'Campos descriptivos (no requieren IDs)' },
      { Field: 'CPU Vendor', Required: 'No', Description: 'Código vendor: intel, amd, apple, other' },
      { Field: 'CPU Model', Required: 'No', Description: 'Modelo exacto: Core i7-1355U, M4 Pro, etc.' },
      { Field: 'RAM Capacity GB', Required: 'No', Description: 'Capacidad en GB: 8, 16, 32, etc.' },
      { Field: 'RAM Mem Type', Required: 'No', Description: 'Tipo: ddr3, ddr4, ddr5, lpddr5, unified' },
      { Field: 'RAM Speed MTS', Required: 'No', Description: 'Velocidad en MT/s: 3200, 5600, etc.' },
      { Field: 'RAM Form Factor', Required: 'No', Description: 'Factor: dimm, sodimm, onboard' },
      { Field: 'Storage Capacity GB', Required: 'No', Description: 'Capacidad en GB: 256, 512, 1000, etc.' },
      { Field: 'Storage Drive Type', Required: 'No', Description: 'Tipo: ssd, hdd' },
      { Field: 'Storage Interface', Required: 'No', Description: 'Interface: nvme, sata, sas' },
      { Field: 'Storage Form Factor', Required: 'No', Description: 'Factor: m2, 2.5, 3.5' },
      
      { Field: '--- OTROS CAMPOS ---', Required: '', Description: '' },
      { Field: 'Serial', Required: 'No', Description: 'Número de serie (único)' },
      { Field: 'IMEI', Required: 'No', Description: 'IMEI para móviles (15 dígitos)' },
      { Field: 'MAC Address', Required: 'No', Description: 'MAC (XX:XX:XX:XX:XX:XX)' },
      { Field: 'IP Address', Required: 'No', Description: 'IP (X.X.X.X)' },
      { Field: 'UUID', Required: 'No', Description: 'UUID del dispositivo' },
      { Field: 'Status ID', Required: 'No', Description: '1=Stock, 2=Asignado, 3=Reparación, 4=Retirado' },
      { Field: 'Purchase Date', Required: 'No', Description: 'Fecha compra (YYYY-MM-DD)' },
      { Field: 'Warranty End', Required: 'No', Description: 'Fin garantía (YYYY-MM-DD)' },
      { Field: 'Location', Required: 'No', Description: 'Ubicación física del activo' },
      { Field: 'Notes', Required: 'No', Description: 'Notas adicionales o comentarios' },
    ];
    const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    worksheet['!cols'] = [
      { wch: 12 },  // Site ID
      { wch: 12 },  // Asset Tag
      { wch: 12 },  // Type ID
      { wch: 12 },  // Employee ID
      { wch: 12 },  // Section ID
      { wch: 12 },  // Model ID
      { wch: 12 },  // OS Version ID
      { wch: 12 },  // CPU Vendor
      { wch: 18 },  // CPU Model
      { wch: 14 },  // RAM Capacity GB
      { wch: 12 },  // RAM Mem Type
      { wch: 14 },  // RAM Speed MTS
      { wch: 14 },  // RAM Form Factor
      { wch: 16 },  // Storage Capacity GB
      { wch: 16 },  // Storage Drive Type
      { wch: 16 },  // Storage Interface
      { wch: 18 },  // Storage Form Factor
      { wch: 18 },  // Serial
      { wch: 18 },  // IMEI
      { wch: 20 },  // MAC Address
      { wch: 15 },  // IP Address
      { wch: 38 },  // UUID
      { wch: 42 },  // Status ID (con leyenda)
      { wch: 15 },  // Purchase Date
      { wch: 15 },  // Warranty End
      { wch: 25 },  // Location
      { wch: 30 },  // Notes
    ];
    instructionsSheet['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 50 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
