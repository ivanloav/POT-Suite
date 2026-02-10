import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageInterface } from '../entities/asset-storage-interface.entity';
import { AssetStorageInterfacesController } from './asset-storage-interfaces.controller';
import { AssetStorageInterfacesService } from './asset-storage-interfaces.service';

@Module({
  imports: [TypeOrmModule.forFeature([StorageInterface])],
  controllers: [AssetStorageInterfacesController],
  providers: [AssetStorageInterfacesService],
  exports: [AssetStorageInterfacesService],
})
export class AssetStorageInterfacesModule {}
