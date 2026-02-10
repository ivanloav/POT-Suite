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

async loginSuite(
  loginDto: LoginDto,
): Promise<{ success: boolean; accessToken?: string; user?: any; apps?: Array<{ code: string; name: string }> }> {
  const { email, password } = loginDto;
  const rows = await this.dataSource.query(
    `
      SELECT id, user_name, email, password_hash, is_active
      FROM auth.users
      WHERE email = $1
    `,
    [email],
  );

  const authUser = rows?.[0];
  if (!authUser || !authUser.is_active) {
    return { success: false };
  }

  const isPasswordValid = await bcrypt.compare(password, authUser.password_hash);
  if (!isPasswordValid) {
    return { success: false };
  }

  const apps = await this.getAppsForEmail(authUser.email);

  const gespackUsers = await this.dataSource.query(
    `
      SELECT user_id, user_name
      FROM gespack.users
      WHERE email = $1
    `,
    [authUser.email],
  );
  const gespackUser = gespackUsers?.[0];
  const jwtUserId = gespackUser?.user_id ?? authUser.id;

  const siteRows = gespackUser?.user_id
    ? await this.dataSource.query(
        `
          SELECT site_id
          FROM gespack.user_site
          WHERE user_id = $1
        `,
        [gespackUser.user_id],
      )
    : [];
  const site_ids = Array.isArray(siteRows) ? siteRows.map((r: any) => Number(r.site_id)) : [];

  const payload = {
    email: authUser.email,
    sub: jwtUserId,
    name: gespackUser?.user_name ?? authUser.user_name ?? authUser.email,
    site_ids,
    app_codes: apps.map((a) => a.code),
  };

  const accessToken = this.jwtService.sign(payload);
  const safeUser = {
    id: authUser.id,
    email: authUser.email,
    userName: authUser.user_name ?? authUser.email,
  };

  return { success: true, accessToken, user: safeUser, apps };
}
}
