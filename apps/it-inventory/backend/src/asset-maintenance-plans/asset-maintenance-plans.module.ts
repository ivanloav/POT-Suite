import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenancePlan } from '../entities/asset-maintenance-plan.entity';
import { AssetMaintenanceRecord } from '../entities/asset-maintenance-record.entity';
import { Holiday } from '../entities/holiday.entity';
import { AssetMaintenancePlansController } from './asset-maintenance-plans.controller';
import { AssetMaintenancePlansService } from './asset-maintenance-plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetMaintenancePlan, AssetMaintenanceRecord, Holiday])],
  controllers: [AssetMaintenancePlansController],
  providers: [AssetMaintenancePlansService],
  exports: [AssetMaintenancePlansService],
})
export class AssetMaintenancePlansModule {}
