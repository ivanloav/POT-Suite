import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageFormFactor } from '../entities/asset-storage-form-factor.entity';
import { AssetStorageFormFactorsController } from './asset-storage-form-factors.controller';
import { AssetStorageFormFactorsService } from './asset-storage-form-factors.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageFormFactor])],
  controllers: [AssetStorageFormFactorsController],
  providers: [AssetStorageFormFactorsService],
  exports: [AssetStorageFormFactorsService],
})
export class AssetStorageFormFactorsModule {}
