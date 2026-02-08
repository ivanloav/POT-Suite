import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenanceRecord } from '../entities/asset-maintenance-record.entity';
import { AssetMaintenanceRecordsController } from './asset-maintenance-records.controller';
import { AssetMaintenanceRecordsService } from './asset-maintenance-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetMaintenanceRecord])],
  controllers: [AssetMaintenanceRecordsController],
  providers: [AssetMaintenanceRecordsService],
  exports: [AssetMaintenanceRecordsService],
})
export class AssetMaintenanceRecordsModule {}
