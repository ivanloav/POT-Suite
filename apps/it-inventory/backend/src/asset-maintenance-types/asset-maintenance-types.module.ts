import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenanceType } from '../entities/asset-maintenance-type.entity';
import { AssetMaintenanceTypesService } from './asset-maintenance-types.service';
import { AssetMaintenanceTypesController } from './asset-maintenance-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AssetMaintenanceType])],
  controllers: [AssetMaintenanceTypesController],
  providers: [AssetMaintenanceTypesService],
  exports: [AssetMaintenanceTypesService],
})
export class AssetMaintenanceTypesModule {}
