import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAssignment } from '../entities/asset-assignment.entity';
import { Asset } from '../entities/asset.entity';
import { AssetStatus } from '../entities/asset-status.entity';
import { Employee } from '../entities/employee.entity';
import { Site } from '../entities/site.entity';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetAssignment, Asset, AssetStatus, Employee, Site]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
