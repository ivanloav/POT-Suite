import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpuSegment } from '../entities/asset-cpu-segment.entity';
import { AssetCpuSegmentsController } from './asset-cpu-segments.controller';
import { AssetCpuSegmentsService } from './asset-cpu-segments.service';

@Module({
  imports: [TypeOrmModule.forFeature([CpuSegment])],
  controllers: [AssetCpuSegmentsController],
  providers: [AssetCpuSegmentsService],
  exports: [AssetCpuSegmentsService],
})
export class AssetCpuSegmentsModule {}
