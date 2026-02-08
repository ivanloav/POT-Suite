import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

async login(
  loginDto: LoginDto,
): Promise<{ success: boolean; accessToken?: string; user?: any }> {
  const { email, password } = loginDto;
  const user = await this.usersService.findUserByEmail(email);

  if (!user || !user.isActive) {
    return { success: false };
  }

  const isPasswordValid = await bcrypt.compare(password, user.userPassword);

  if (!isPasswordValid) {
    return { success: false };
  }

  const userSites = await this.usersService.findSitesForUser(user.userId);
  const site_ids = userSites.map((s: any) => Number(s.siteId));

  const payload = {
    email: user.email,
    sub: user.userId,
    name: user.userName,
    site_ids,
  };
  
  const accessToken = this.jwtService.sign(payload);
  
  const { userPassword, password: _pwd, salt, ...safeUser } = user as any;
  return { success: true, accessToken, user: { ...safeUser, site_ids } };
}

async getAppsForEmail(email: string): Promise<Array<{ code: string; name: string }>> {
  if (!email) return [];
  const rows = await this.dataSource.query(
    `
      SELECT a.code, a.name
      FROM auth.users u
      JOIN auth.user_apps ua ON ua.user_id = u.id AND ua.is_active = TRUE
      JOIN auth.apps a ON a.id = ua.app_id AND a.is_active = TRUE
      WHERE u.email = $1
      ORDER BY a.code
    `,
    [email],
  );
  return Array.isArray(rows) ? rows : [];
}
}
