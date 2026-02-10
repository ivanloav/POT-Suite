import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetCpu } from '../entities/asset-cpu.entity';
import { CpuVendor } from '../entities/asset-cpu-vendor.entity';
import { CpuSegment } from '../entities/asset-cpu-segment.entity';
import { AssetCpuService } from './asset-cpu.service';
import { AssetCpuController } from './asset-cpu.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetCpu,
      CpuVendor,
      CpuSegment,
    ]),
  ],
  controllers: [AssetCpuController],
  providers: [AssetCpuService],
  exports: [AssetCpuService],
})
export class AssetCpuModule {}
