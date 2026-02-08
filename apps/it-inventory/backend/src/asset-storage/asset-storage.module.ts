import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageOption } from '../entities/storage-option.entity';
import { StorageDriveType } from '../entities/asset-storage-drive-type.entity';
import { StorageInterface } from '../entities/asset-storage-interface.entity';
import { StorageFormFactor } from '../entities/asset-storage-form-factor.entity';
import { AssetStorageService } from './asset-storage.service';
import { AssetStorageController } from './asset-storage.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StorageOption,
      StorageDriveType,
      StorageInterface,
      StorageFormFactor,
    ]),
  ],
  controllers: [AssetStorageController],
  providers: [AssetStorageService],
  exports: [AssetStorageService],
})
export class AssetStorageModule {}
