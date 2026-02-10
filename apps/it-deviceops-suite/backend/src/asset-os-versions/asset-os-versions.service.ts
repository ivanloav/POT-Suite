import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetOsVersion } from '../entities/asset-os-version.entity';
import { AssetOsFamily } from '../entities/asset-os-family.entity';
import { CreateOsVersionDto, UpdateOsVersionDto } from './dto/asset-os-version.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AssetOsVersionsService {
  constructor(
    @InjectRepository(AssetOsVersion)
    private readonly assetOsVersionRepository: Repository<AssetOsVersion>,
    @InjectRepository(AssetOsFamily)
    private readonly assetOsFamilyRepository: Repository<AssetOsFamily>,
  ) {}

  async getOsVersions(familyId?: number, brandId?: number, typeId?: number) {
    const queryBuilder = this.assetOsVersionRepository
      .createQueryBuilder('osv')
      .leftJoinAndSelect('osv.osFamily', 'osf')
      .leftJoinAndSelect('osv.creator', 'creator')
      .leftJoinAndSelect('osv.updater', 'updater')

    if (familyId) {
      queryBuilder.andWhere('osv.osFamilyId = :familyId', { familyId });
    }

    if (typeId && brandId) {
      queryBuilder
        .andWhere('osv.osFamilyId IN (' +
          'SELECT os_family_id FROM asset_type_os_compatibility WHERE type_id = :typeId' +
        ')', { typeId })
        .andWhere('osv.osFamilyId IN (' +
          'SELECT os_family_id FROM asset_brand_os_compatibility WHERE brand_id = :brandId' +
        ')', { brandId });
    } else if (typeId) {
      queryBuilder
        .andWhere('osv.osFamilyId IN (' +
          'SELECT os_family_id FROM asset_type_os_compatibility WHERE type_id = :typeId' +
        ')', { typeId });
    } else if (brandId) {
      queryBuilder
        .andWhere('osv.osFamilyId IN (' +
          'SELECT os_family_id FROM asset_brand_os_compatibility WHERE brand_id = :brandId' +
        ')', { brandId });
    }

    return await queryBuilder
      .orderBy('osv.id', 'ASC')
      .getMany();
  }

  async createOsVersion(data: CreateOsVersionDto, userId: number) {
    const osVersion = this.assetOsVersionRepository.create({
      ...data,
      createdBy: userId,
    });
    try {
      return await this.assetOsVersionRepository.save(osVersion);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_os_versions')) {
          throw new ConflictException('Ya existe una versión con ese nombre para esta familia de SO');
        }
        throw new ConflictException('Ya existe una versión con esos datos');
      }
      throw error;
    }
  }

  async getOsVersionById(id: number) {
    return await this.assetOsVersionRepository.findOne({
      where: { id },
      relations: ['osFamily', 'creator', 'updater'],
    });
  }

  async updateOsVersion(id: number, data: UpdateOsVersionDto, userId: number) {
    try {
      await this.assetOsVersionRepository.update(id, {
        ...data,
        updatedBy: userId,
      });
      return this.getOsVersionById(id);
    } catch (error: any) {
      if (error.code === '23505') {
        const constraintName = error.constraint;
        if (constraintName?.includes('ux_os_versions')) {
          throw new ConflictException('Ya existe una versión con ese nombre para esta familia de SO');
        }
        throw new ConflictException('Ya existe una versión con esos datos');
      }
      throw error;
    }
  }

  async exportToExcel(): Promise<Buffer> {
    const osVersions = await this.assetOsVersionRepository.find({
      relations: ['osFamily'],
      order: { id: 'ASC' },
    });

    const data = osVersions.map(osv => ({
      'OS Family': osv.osFamily?.name || '',
      'Name': osv.name,
      'Is Active': osv.isActive ? 'Sí' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OS Versions');

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 10 },
    ];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const osFamilies = await this.assetOsFamilyRepository.find({
      where: { isActive: true },
    });

    const examples = [
      {
        'OS Family': 'Windows',
        'Name': 'Windows 11 Pro 26H2',
        'Is Active': 'Sí',
      },
      {
        'OS Family': 'macOS',
        'Name': 'macOS Sequoia 15.8',
        'Is Active': 'Sí',
      },
      {
        'OS Family': 'Linux',
        'Name': 'Ubuntu 24.04 LTS',
        'Is Active': 'Sí',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(examples);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OS Versions');

    const familiesData = osFamilies.map(f => ({ 'Available OS Families': f.name }));
    const familiesSheet = XLSX.utils.json_to_sheet(familiesData);
    XLSX.utils.book_append_sheet(workbook, familiesSheet, 'OS Families');

    worksheet['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 10 }];
    familiesSheet['!cols'] = [{ wch: 25 }];

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer, userId: number): Promise<{ insertados: number; duplicados: any[]; errores: string[] }> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const errores: string[] = [];
    const duplicados: any[] = [];
    let insertados = 0;

    const osFamilies = await this.assetOsFamilyRepository.find();
    const familyMap = new Map(osFamilies.map(f => [f.name.toLowerCase(), f]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque Excel empieza en 1 y hay header

      try {
        if (!row['OS Family'] || !row['Name']) {
          errores.push(`Fila ${rowNum}: Faltan campos requeridos (OS Family, Name)`);
          continue;
        }

        const familyName = String(row['OS Family']).trim();
        const osFamily = familyMap.get(familyName.toLowerCase());

        if (!osFamily) {
          errores.push(`Fila ${rowNum}: Familia de SO "${familyName}" no encontrada`);
          continue;
        }

        const name = String(row['Name']).trim();
        const isActiveStr = String(row['Is Active'] || 'Sí').trim().toLowerCase();
        const isActive = isActiveStr === 'sí' || isActiveStr === 'si' || isActiveStr === 'yes' || isActiveStr === 'true';

        const existing = await this.assetOsVersionRepository.findOne({
          where: { osFamilyId: osFamily.id, name },
        });

        if (existing) {
          duplicados.push({
            fila: rowNum,
            familia: familyName,
            nombre: name,
            idExistente: existing.id,
            datos: {
              osFamilyId: osFamily.id,
              name,
              isActive,
              updatedBy: userId,
            }
          });
        } else {
          const newOsVersion = this.assetOsVersionRepository.create({
            osFamilyId: osFamily.id,
            name,
            isActive,
            createdBy: userId,
          });
          await this.assetOsVersionRepository.save(newOsVersion);
          insertados++;
        }
      } catch (error: any) {
        errores.push(`Fila ${rowNum}: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }

  async updateDuplicatesFromExcel(duplicates: any[]): Promise<{ actualizados: number; errores: string[] }> {
    const errores: string[] = [];
    let actualizados = 0;

    for (const dup of duplicates) {
      try {
        await this.assetOsVersionRepository.update(dup.idExistente, dup.datos);
        actualizados++;
      } catch (error: any) {
        errores.push(`Fila ${dup.fila}: ${error.message}`);
      }
    }

    return { actualizados, errores };
  }
}
