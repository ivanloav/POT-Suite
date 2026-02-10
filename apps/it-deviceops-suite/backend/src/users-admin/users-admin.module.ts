import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserSite } from '../entities/user-site.entity';
import { UserSiteRole } from '../entities/user-site-role.entity';
import { UsersAdminController } from './users-admin.controller';
import { UsersAdminService } from './users-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSite, UserSiteRole])],
  controllers: [UsersAdminController],
  providers: [UsersAdminService],
  exports: [UsersAdminService],
})
export class UsersAdminModule {}
