import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetType } from '../entities/asset-type.entity';
import { AssetBrand } from '../entities/asset-brand.entity';
import { AssetModel } from '../entities/asset-model.entity';
import { Section } from '../entities/section.entity';
import { AssetOsFamily } from '../entities/asset-os-family.entity';
import { AssetOsVersion } from '../entities/asset-os-version.entity';
import { AssetCpu } from '../entities/asset-cpu.entity';
import { AssetRamOption } from '../entities/asset-ram-option.entity';
import { StorageOption } from '../entities/storage-option.entity';
import { AssetStatus } from '../entities/asset-status.entity';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetType,
      AssetBrand,
      AssetModel,
      Section,
      AssetOsFamily,
      AssetOsVersion,
      AssetCpu,
      AssetRamOption,
      StorageOption,
      AssetStatus,
    ]),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}
