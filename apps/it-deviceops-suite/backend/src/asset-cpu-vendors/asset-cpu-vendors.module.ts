import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpuVendor } from '../entities/asset-cpu-vendor.entity';
import { AssetCpuVendorsService } from './asset-cpu-vendors.service';
import { AssetCpuVendorsController } from './asset-cpu-vendors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CpuVendor])],
  controllers: [AssetCpuVendorsController],
  providers: [AssetCpuVendorsService],
  exports: [AssetCpuVendorsService],
})
export class AssetCpuVendorsModule {}
