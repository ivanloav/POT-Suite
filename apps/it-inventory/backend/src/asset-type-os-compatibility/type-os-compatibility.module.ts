import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOsCompatibilityController } from './type-os-compatibility.controller';
import { TypeOsCompatibilityService } from './type-os-compatibility.service';
import { AssetTypeOsCompatibility } from '../entities/asset-type-os-compatibility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetTypeOsCompatibility])],
  controllers: [TypeOsCompatibilityController],
  providers: [TypeOsCompatibilityService],
  exports: [TypeOsCompatibilityService],
})
export class TypeOsCompatibilityModule {}
