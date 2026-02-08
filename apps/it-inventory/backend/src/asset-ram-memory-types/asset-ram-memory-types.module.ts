import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRamMemoryType } from '../entities/asset-ram-memory-type.entity';
import { AssetRamMemoryTypesController } from './asset-ram-memory-types.controller';
import { AssetRamMemoryTypesService } from './asset-ram-memory-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetRamMemoryType])],
  controllers: [AssetRamMemoryTypesController],
  providers: [AssetRamMemoryTypesService],
  exports: [AssetRamMemoryTypesService],
})
export class AssetRamMemoryTypesModule {}
