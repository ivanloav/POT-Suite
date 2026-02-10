import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandOsCompatibilityController } from './brand-os-compatibility.controller';
import { BrandOsCompatibilityService } from './brand-os-compatibility.service';
import { AssetBrandOsCompatibility } from '../entities/asset-brand-os-compatibility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetBrandOsCompatibility])],
  controllers: [BrandOsCompatibilityController],
  providers: [BrandOsCompatibilityService],
  exports: [BrandOsCompatibilityService],
})
export class BrandOsCompatibilityModule {}
