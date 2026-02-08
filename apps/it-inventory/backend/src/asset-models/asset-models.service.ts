import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetModel } from '../entities/asset-model.entity';
import { AssetType } from '../entities/asset-type.entity';
import { AssetBrand } from '../entities/asset-brand.entity';
import { CreateAssetModelDto } from './dto/asset-model.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetModelsService {
  constructor(
    @InjectRepository(AssetModel)
    private readonly assetModelRepository: Repository<AssetModel>,
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,
    @InjectRepository(AssetBrand)
    private readonly assetBrandRepository: Repository<AssetBrand>,
  ) {}

  // Asset Models
  async getAssetModels(familyId?: number, brandId?: number, typeId?: number) {
    const queryBuilder = this.assetModelRepository
      .createQueryBuilder('am')
      .leftJoinAndSelect('am.type', 'type')
      .leftJoinAndSelect('am.brand', 'brand')
      .leftJoinAndSelect('am.creator', 'creator')
      .leftJoinAndSelect('am.updater', 'updater');

    if (typeId) {
      queryBuilder.andWhere('am.typeId = :typeId', { typeId });
    }

    if (brandId) {
      queryBuilder.andWhere('am.brandId = :brandId', { brandId });
    }

    return await queryBuilder
      .orderBy('am.id', 'ASC')
      .getMany();
  }

  async createAssetModel(data: CreateAssetModelDto) {
    const assetModel = this.assetModelRepository.create(data);
    try {
      return await this.assetModelRepository.save(assetModel);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_models')) {
          throw new ConflictException('Ya existe un modelo con ese nombre para esta combinación de tipo y marca');
        }
        throw new ConflictException('Ya existe un modelo con esos datos');
      }
      throw error;
    }
  }

  async getAssetModelById(id: number) {
    return await this.assetModelRepository.findOne({
      where: { id },
      relations: ['type', 'brand', 'creator', 'updater'],
    });
  }

  async updateAssetModel(id: number, data: CreateAssetModelDto) {
    try {
      await this.assetModelRepository.update(id, data);
      return this.getAssetModelById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_asset_models')) {
          throw new ConflictException('Ya existe un modelo con ese nombre para esta combinación de tipo y marca');
        }
        throw new ConflictException('Ya existe un modelo con esos datos');
      }
      throw error;
    }
  }

  // Exportar modelos de activos a Excel
  async exportToExcel(): Promise<Buffer> {
    const assetModels = await this.assetModelRepository.find({
      relations: ['type', 'brand', 'creator', 'updater'],
      order: { id: 'ASC' },
    });

    const data = assetModels.map(am => ({
      'Type': am.type?.name || '',
      'Brand': am.brand?.name || '',
      'Model': am.model,
      'Is Active': am.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Models');

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 40 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Generar plantilla de ejemplo para importación
  async generateTemplate(): Promise<Buffer> {
    const assetTypes = await this.assetTypeRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const assetBrands = await this.assetBrandRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    const examples = [
      {
        'Type': 'Laptop',
        'Brand': 'Apple',
        'Model': 'MacBook Pro 14" M4 Pro',
        'Is Active': 'Sí',
      },
      {
        'Type': 'Desktop',
        'Brand': 'Dell',
        'Model': 'OptiPlex 7090',
        'Is Active': 'Sí',
      },
      {
        'Type': 'Monitor',
        'Brand': 'LG',
        'Model': 'UltraWide 34WN80C',
        'Is Active': 'Sí',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asset Models');

    // Añadir hoja con tipos disponibles
    const typesData = assetTypes.map(t => ({ 'Available Types': t.name }));
    const typesSheet = XLSX.utils.json_to_sheet(typesData);
    XLSX.utils.book_append_sheet(workbook, typesSheet, 'Asset Types');

    // Añadir hoja con marcas disponibles
    const brandsData = assetBrands.map(b => ({ 'Available Brands': b.name }));
    const brandsSheet = XLSX.utils.json_to_sheet(brandsData);
    XLSX.utils.book_append_sheet(workbook, brandsSheet, 'Asset Brands');

    worksheet['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 40 }, { wch: 10 }];
    typesSheet['!cols'] = [{ wch: 25 }];
    brandsSheet['!cols'] = [{ wch: 25 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // Importar modelos de activos desde Excel
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

    // Cargar todos los tipos y marcas
    const assetTypes = await this.assetTypeRepository.find();
    const typeMap = new Map(assetTypes.map(t => [t.name.toLowerCase(), t]));

    const assetBrands = await this.assetBrandRepository.find();
    const brandMap = new Map(assetBrands.map(b => [b.name.toLowerCase(), b]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header

      try {
        // Validar campos requeridos
        if (!row['Type'] || !row['Brand'] || !row['Model']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (Type, Brand, Model)`);
          continue;
        }

        const typeName = String(row['Type']).trim();
        const assetType = typeMap.get(typeName.toLowerCase());

        if (!assetType) {
          errores.push(`Fila ${rowNum}: Tipo de activo "${typeName}" no encontrado`);
          continue;
        }

        const brandName = String(row['Brand']).trim();
        const assetBrand = brandMap.get(brandName.toLowerCase());

        if (!assetBrand) {
          errores.push(`Fila ${rowNum}: Marca "${brandName}" no encontrada`);
          continue;
        }

        const model = String(row['Model']).trim();
        const isActiveStr = String(row['Is Active'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        // Buscar si ya existe (por tipo, marca y modelo)
        const existing = await this.assetModelRepository.findOne({
          where: { 
            typeId: assetType.id, 
            brandId: assetBrand.id,
            model 
          },
        });

        if (existing) {
          // Detectar duplicado
          duplicados.push({
            fila: rowNum,
            modelo: model,
            tipo: typeName,
            marca: brandName,
            idExistente: existing.id,
            datos: {
              typeId: assetType.id,
              brandId: assetBrand.id,
              model,
              isActive,
              updatedBy: userId,
            }
          });
        } else {
          // Crear nuevo
          const newModel = this.assetModelRepository.create({
            typeId: assetType.id,
            brandId: assetBrand.id,
            model,
            isActive,
            createdBy: userId,
          });
          await this.assetModelRepository.save(newModel);
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
        await this.assetModelRepository.update(duplicate.idExistente, duplicate.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Error al actualizar modelo ${duplicate.modelo}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
