import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandRamCompatibilityController } from './brand-ram-compatibility.controller';
import { BrandRamCompatibilityService } from './brand-ram-compatibility.service';
import { AssetBrandRamCompatibility } from '../entities/asset-brand-ram-compatibility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetBrandRamCompatibility])],
  controllers: [BrandRamCompatibilityController],
  providers: [BrandRamCompatibilityService],
  exports: [BrandRamCompatibilityService],
})
export class BrandRamCompatibilityModule {}
