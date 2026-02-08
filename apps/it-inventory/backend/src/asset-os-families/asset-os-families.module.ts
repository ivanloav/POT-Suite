import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetOsFamily } from '../entities/asset-os-family.entity';
import { AssetOsFamiliesService } from './asset-os-families.service';
import { AssetOsFamiliesController } from './asset-os-families.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetOsFamily,
    ]),
  ],
  controllers: [AssetOsFamiliesController],
  providers: [AssetOsFamiliesService],
  exports: [AssetOsFamiliesService],
})
export class AssetOsFamiliesModule {}
