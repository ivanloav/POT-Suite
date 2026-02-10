import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../entities/permission.entity';
import { PermissionsAdminController } from './permissions-admin.controller';
import { PermissionsAdminService } from './permissions-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsAdminController],
  providers: [PermissionsAdminService],
  exports: [PermissionsAdminService],
})
export class PermissionsAdminModule {}
