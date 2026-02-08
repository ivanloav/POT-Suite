import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageDriveType } from '../entities/asset-storage-drive-type.entity';
import { AssetStorageDriveTypesController } from './asset-storage-drive-types.controller';
import { AssetStorageDriveTypesService } from './asset-storage-drive-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageDriveType])],
  controllers: [AssetStorageDriveTypesController],
  providers: [AssetStorageDriveTypesService],
  exports: [AssetStorageDriveTypesService],
})
export class AssetStorageDriveTypesModule {}
