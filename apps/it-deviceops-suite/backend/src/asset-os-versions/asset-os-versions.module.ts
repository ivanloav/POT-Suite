import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetOsVersion } from '../entities/asset-os-version.entity';
import { AssetOsFamily } from '../entities/asset-os-family.entity';
import { AssetOsVersionsService } from './asset-os-versions.service';
import { AssetOsVersionsController } from './asset-os-versions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AssetOsVersion,
      AssetOsFamily,
    ]),
  ],
  controllers: [AssetOsVersionsController],
  providers: [AssetOsVersionsService],
  exports: [AssetOsVersionsService],
})
export class AssetOsVersionsModule {}
