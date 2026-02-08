import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetBrandOsCompatibility } from '../entities/asset-brand-os-compatibility.entity';
import { CreateBrandOsCompatibilityDto, DeleteBrandOsCompatibilityDto } from './dto/brand-os-compatibility.dto';

@Injectable()
export class BrandOsCompatibilityService {
  constructor(
    @InjectRepository(AssetBrandOsCompatibility)
    private readonly compatibilityRepository: Repository<AssetBrandOsCompatibility>,
  ) {}

  async getByBrand(brandId: number) {
    return this.compatibilityRepository.find({
      where: { brandId },
      relations: ['brand', 'osFamily', 'creator'],
      order: { osFamily: { name: 'ASC' } },
    });
  }

  async create(dto: CreateBrandOsCompatibilityDto, userId: number) {
    const compatibility = this.compatibilityRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.compatibilityRepository.save(compatibility);
  }

  async delete(dto: DeleteBrandOsCompatibilityDto) {
    await this.compatibilityRepository.delete({
      brandId: dto.brandId,
      osFamilyId: dto.osFamilyId,
    });
  }

  async updateByBrand(brandId: number, osFamilyIds: number[], userId: number) {
    // Eliminar compatibilidades existentes
    await this.compatibilityRepository.delete({ brandId });

    // Crear nuevas compatibilidades
    if (osFamilyIds && osFamilyIds.length > 0) {
      const compatibilities = osFamilyIds.map(osFamilyId => ({
        brandId,
        osFamilyId,
        createdBy: userId,
      }));
      await this.compatibilityRepository.save(compatibilities);
    }
  }
}
