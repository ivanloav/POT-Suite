import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../entities/asset.entity';
import { AssetType } from '../entities/asset-type.entity';
import { AssetBrand } from '../entities/asset-brand.entity';
import { AssetModel } from '../entities/asset-model.entity';
import { Section } from '../entities/section.entity';
import { AssetOsFamily } from '../entities/asset-os-family.entity';
import { AssetOsVersion } from '../entities/asset-os-version.entity';
import { AssetCpu } from '../entities/asset-cpu.entity';
import { AssetRamOption } from '../entities/asset-ram-option.entity';
import { StorageOption } from '../entities/storage-option.entity';
import { AssetRamMemoryType } from '../entities/asset-ram-memory-type.entity';
import { AssetRamFormFactor } from '../entities/asset-ram-form-factor.entity';
import { AssetStatus } from '../entities/asset-status.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      AssetType,
      AssetBrand,
      AssetModel,
      Section,
      AssetOsFamily,
      AssetOsVersion,
      AssetCpu,
      AssetRamOption,
      StorageOption,
      AssetRamMemoryType,
      AssetRamFormFactor,
      AssetStatus,
    ]),
    AssignmentsModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
