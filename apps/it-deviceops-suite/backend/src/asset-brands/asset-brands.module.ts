import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetBrand } from '../entities/asset-brand.entity';
import { AssetBrandsController } from './asset-brands.controller';
import { AssetBrandsService } from './asset-brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetBrand])],
  controllers: [AssetBrandsController],
  providers: [AssetBrandsService],
  exports: [AssetBrandsService],
})
export class AssetBrandsModule {}
