import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandCpuCompatibilityController } from './brand-cpu-compatibility.controller';
import { BrandCpuCompatibilityService } from './brand-cpu-compatibility.service';
import { AssetBrandCpuCompatibility } from '../entities/asset-brand-cpu-compatibility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetBrandCpuCompatibility])],
  controllers: [BrandCpuCompatibilityController],
  providers: [BrandCpuCompatibilityService],
  exports: [BrandCpuCompatibilityService],
})
export class BrandCpuCompatibilityModule {}
