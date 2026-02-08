import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRamOption } from '../entities/asset-ram-option.entity';
import { AssetRamFormFactor } from '../entities/asset-ram-form-factor.entity';
import { AssetRamMemoryType } from '../entities/asset-ram-memory-type.entity';
import { AssetRamService } from './asset-ram.service';
import { AssetRamController } from './asset-ram.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetRamOption,
      AssetRamFormFactor,
      AssetRamMemoryType,
    ]),
  ],
  controllers: [AssetRamController],
  providers: [AssetRamService],
  exports: [AssetRamService],
})
export class AssetRamModule {}
