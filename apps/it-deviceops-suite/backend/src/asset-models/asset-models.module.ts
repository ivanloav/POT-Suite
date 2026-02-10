import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetModel } from '../entities/asset-model.entity';
import { AssetType } from '../entities/asset-type.entity';
import { AssetBrand } from '../entities/asset-brand.entity';
import { AssetModelsService } from './asset-models.service';
import { AssetModelsController } from './asset-models.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetModel,
      AssetType,
      AssetBrand,
    ]),
  ],
  controllers: [AssetModelsController],
  providers: [AssetModelsService],
  exports: [AssetModelsService],
})
export class AssetModelsModule {}
