import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetBrandRamCompatibility } from '../entities/asset-brand-ram-compatibility.entity';
import { CreateBrandRamCompatibilityDto, DeleteBrandRamCompatibilityDto } from './dto/brand-ram-compatibility.dto';

@Injectable()
export class BrandRamCompatibilityService {
  constructor(
    @InjectRepository(AssetBrandRamCompatibility)
    private readonly compatibilityRepository: Repository<AssetBrandRamCompatibility>,
  ) {}

  async getByBrand(brandId: number) {
    return this.compatibilityRepository.find({
      where: { brandId },
      relations: ['brand', 'ramType', 'creator'],
      order: { ramType: { name: 'ASC' } },
    });
  }

  async create(dto: CreateBrandRamCompatibilityDto, userId: number) {
    const compatibility = this.compatibilityRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.compatibilityRepository.save(compatibility);
  }

  async delete(dto: DeleteBrandRamCompatibilityDto) {
    await this.compatibilityRepository.delete({
      brandId: dto.brandId,
      ramTypeId: dto.ramTypeId,
    });
  }

  async updateByBrand(brandId: number, ramTypeIds: number[], userId: number) {
    // Eliminar compatibilidades existentes
    await this.compatibilityRepository.delete({ brandId });

    // Crear nuevas compatibilidades
    if (ramTypeIds && ramTypeIds.length > 0) {
      const compatibilities = ramTypeIds.map(ramTypeId => ({
        brandId,
        ramTypeId,
        createdBy: userId,
      }));
      await this.compatibilityRepository.save(compatibilities);
    }
  }
}
