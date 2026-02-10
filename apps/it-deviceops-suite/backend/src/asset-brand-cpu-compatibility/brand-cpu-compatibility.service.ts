import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetBrandCpuCompatibility } from '../entities/asset-brand-cpu-compatibility.entity';
import { CreateBrandCpuCompatibilityDto, DeleteBrandCpuCompatibilityDto } from './dto/brand-cpu-compatibility.dto';

@Injectable()
export class BrandCpuCompatibilityService {
  constructor(
    @InjectRepository(AssetBrandCpuCompatibility)
    private readonly compatibilityRepository: Repository<AssetBrandCpuCompatibility>,
  ) {}

  async getByBrand(brandId: number) {
    return this.compatibilityRepository.find({
      where: { brandId },
      relations: ['brand', 'cpuVendor', 'creator'],
      order: { cpuVendor: { name: 'ASC' } },
    });
  }

  async create(dto: CreateBrandCpuCompatibilityDto, userId: number) {
    const compatibility = this.compatibilityRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.compatibilityRepository.save(compatibility);
  }

  async delete(dto: DeleteBrandCpuCompatibilityDto) {
    await this.compatibilityRepository.delete({
      brandId: dto.brandId,
      cpuVendorId: dto.cpuVendorId,
    });
  }

  async updateByBrand(brandId: number, cpuVendorIds: number[], userId: number) {
    // Eliminar compatibilidades existentes
    await this.compatibilityRepository.delete({ brandId });

    // Crear nuevas compatibilidades
    if (cpuVendorIds && cpuVendorIds.length > 0) {
      const compatibilities = cpuVendorIds.map(cpuVendorId => ({
        brandId,
        cpuVendorId,
        createdBy: userId,
      }));
      await this.compatibilityRepository.save(compatibilities);
    }
  }
}
