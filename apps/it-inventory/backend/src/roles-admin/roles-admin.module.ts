import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { RolesAdminController } from './roles-admin.controller';
import { RolesAdminService } from './roles-admin.service';
import { RolePermissionsModule } from '../role-permissions/role-permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => RolePermissionsModule),
  ],
  controllers: [RolesAdminController],
  providers: [RolesAdminService],
  exports: [RolesAdminService],
})
export class RolesAdminModule {}
