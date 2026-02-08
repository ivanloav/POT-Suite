import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetType } from '../entities/asset-type.entity';
import { Section } from '../entities/section.entity';
import { AssetBrand } from '../entities/asset-brand.entity';
import { AssetModel } from '../entities/asset-model.entity';
import { AssetOsFamily } from '../entities/asset-os-family.entity';
//import { AssetOsVersion } from '../entities/asset-os-version.entity';
import { AssetCpu } from '../entities/asset-cpu.entity';
import { AssetRamOption } from '../entities/asset-ram-option.entity';
import { StorageOption } from '../entities/storage-option.entity';
import { AssetStatus } from '../entities/asset-status.entity';
import { CreateCatalogAssetBrandDto } from './dto/catalog.dto';
import { CreateAssetModelDto } from '../asset-models/dto/asset-model.dto';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(AssetType)
    private readonly assetTypeRepository: Repository<AssetType>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(AssetBrand)
    private readonly assetBrandRepository: Repository<AssetBrand>,
    @InjectRepository(AssetModel)
    private readonly assetModelRepository: Repository<AssetModel>,
    @InjectRepository(AssetOsFamily)
    private readonly assetOsFamilyRepository: Repository<AssetOsFamily>,
    //@InjectRepository(AssetOsVersion)
    //private readonly assetOsVersionRepository: Repository<AssetOsVersion>,
    @InjectRepository(AssetCpu)
    private readonly cpuRepository: Repository<AssetCpu>,
    @InjectRepository(AssetRamOption)
    private readonly ramRepository: Repository<AssetRamOption>,
    @InjectRepository(StorageOption)
    private readonly storageRepository: Repository<StorageOption>,
    @InjectRepository(AssetStatus)
    private readonly assetStatusRepository: Repository<AssetStatus>,
  ) {}

  // Asset Types
  async getAssetTypes() {
    return await this.assetTypeRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  // Asset Statuses
  async getAssetStatuses() {
    return await this.assetStatusRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  // Sections (filtrar por site)
  async getSections(siteId?: number) {
    const where: any = { isActive: true };
    
    if (siteId) {
      where.siteId = siteId;
    }
    
    return await this.sectionRepository.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  // Asset Brands
  async getAssetBrands() {
    return await this.assetBrandRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async createAssetBrand(data: CreateCatalogAssetBrandDto) {
    const brand = this.assetBrandRepository.create(data);
    return await this.assetBrandRepository.save(brand);
  }

  // Asset Models
  async getAssetModels(typeId?: number) {
    const queryBuilder = this.assetModelRepository
      .createQueryBuilder('am')
      .leftJoinAndSelect('am.type', 'type')
      .leftJoinAndSelect('am.brand', 'brand')
      .where('am.isActive = :isActive', { isActive: true });

    if (typeId) {
      queryBuilder.andWhere('am.typeId = :typeId', { typeId });
    }

    return await queryBuilder
      .orderBy('brand.name', 'ASC')
      .addOrderBy('am.model', 'ASC')
      .getMany();
  }

  async createAssetModel(data: CreateAssetModelDto) {
    const model = this.assetModelRepository.create(data);
    return await this.assetModelRepository.save(model);
  }

  // OS Families
  async getOsFamilies() {
    return await this.assetOsFamilyRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }
  
  // CPUs (con filtrado opcional por brandId)
  async getCpus(brandId?: number) {
    const queryBuilder = this.cpuRepository
      .createQueryBuilder('cpu')
      .leftJoinAndSelect('cpu.vendor', 'vendor')
      .where('cpu.isActive = :isActive', { isActive: true });

    if (brandId) {
      // Filtrar por compatibilidad con la marca
      queryBuilder
        .innerJoin('asset_brand_cpu_compatibility', 'bcc', 'bcc.cpu_vendor_id = cpu.vendorId')
        .andWhere('bcc.brand_id = :brandId', { brandId });
    }

    return await queryBuilder
      .orderBy('cpu.vendorId', 'ASC')
      .addOrderBy('cpu.model', 'ASC')
      .getMany();
  }

  // RAM Options (con filtrado opcional por brandId)
  async getRamOptions(brandId?: number) {
    const queryBuilder = this.ramRepository
      .createQueryBuilder('ram')
      .leftJoinAndSelect('ram.memType', 'memType')
      .leftJoinAndSelect('ram.formFactor', 'formFactor')
      .where('ram.isActive = :isActive', { isActive: true });

    if (brandId) {
      // Filtrar por compatibilidad con la marca
      queryBuilder
        .innerJoin('asset_brand_ram_compatibility', 'brc', 'brc.ram_type_id = ram.memTypeId')
        .andWhere('brc.brand_id = :brandId', { brandId });
    }

    return await queryBuilder
      .orderBy('ram.capacityGb', 'ASC')
      .addOrderBy('ram.memTypeId', 'ASC')
      .getMany();
  }

  // Storage Options
  async getStorageOptions() {
    return await this.storageRepository.find({
      where: { isActive: true },
      relations: ['driveType', 'formFactor', 'interface'],
      order: { capacityGb: 'ASC' },
    });
  }
}
