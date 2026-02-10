import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRamFormFactor } from '../entities/asset-ram-form-factor.entity';
import { AssetRamFormFactorsController } from './asset-ram-form-factors.controller';
import { AssetRamFormFactorsService } from './asset-ram-form-factors.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetRamFormFactor])],
  controllers: [AssetRamFormFactorsController],
  providers: [AssetRamFormFactorsService],
  exports: [AssetRamFormFactorsService],
})
export class AssetRamFormFactorsModule {}
