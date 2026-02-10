import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetTypeOsCompatibility } from '../entities/asset-type-os-compatibility.entity';
import { CreateTypeOsCompatibilityDto, DeleteTypeOsCompatibilityDto } from './dto/type-os-compatibility.dto';

@Injectable()
export class TypeOsCompatibilityService {
  constructor(
    @InjectRepository(AssetTypeOsCompatibility)
    private readonly compatibilityRepository: Repository<AssetTypeOsCompatibility>,
  ) {}

  async getByType(typeId: number) {
    return this.compatibilityRepository.find({
      where: { typeId },
      relations: ['type', 'osFamily', 'creator'],
      order: { osFamily: { name: 'ASC' } },
    });
  }

  async create(dto: CreateTypeOsCompatibilityDto, userId: number) {
    const compatibility = this.compatibilityRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.compatibilityRepository.save(compatibility);
  }

  async delete(dto: DeleteTypeOsCompatibilityDto) {
    await this.compatibilityRepository.delete({
      typeId: dto.typeId,
      osFamilyId: dto.osFamilyId,
    });
  }

  async updateByType(typeId: number, osFamilyIds: number[], userId: number) {
    // Eliminar compatibilidades existentes
    await this.compatibilityRepository.delete({ typeId });

    // Crear nuevas compatibilidades
    if (osFamilyIds && osFamilyIds.length > 0) {
      const compatibilities = osFamilyIds.map(osFamilyId => ({
        typeId,
        osFamilyId,
        createdBy: userId,
      }));
      await this.compatibilityRepository.save(compatibilities);
    }
  }
}
