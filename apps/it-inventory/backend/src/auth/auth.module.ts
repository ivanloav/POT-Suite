import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { UserSiteRole } from '../entities/user-site-role.entity';
import { UserSite } from '../entities/user-site.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { LoginAttempt } from '../entities/login-attempt.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, UserSiteRole, UserSite, RolePermission, LoginAttempt, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
