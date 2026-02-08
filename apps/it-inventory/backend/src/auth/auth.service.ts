import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserSiteRole } from '../entities/user-site-role.entity';
import { UserSite } from '../entities/user-site.entity';
import { Site } from '../entities/site.entity';
import { Permission } from '../entities/permission.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserSiteRole)
    private readonly userSiteRoleRepository: Repository<UserSiteRole>,
    @InjectRepository(UserSite)
    private readonly userSiteRepository: Repository<UserSite>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  private generateAccessToken(payload: any): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET no está definido'); // Error interno del servidor

    return jwt.sign(payload, jwtSecret, {
      expiresIn: '1h',
      issuer: 'it-inventory',
      audience: 'it-inventory-client',
      algorithm: 'HS256',
    });
  }

  private async generateRefreshToken(
    userId: number,
    ipAddress: string | null,
    userAgent: string | null,
  ): Promise<string> {
    // Generar token criptográficamente seguro
    const token = crypto.randomBytes(64).toString('hex');
    
    // Expiración: 7 días
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Guardar en DB
    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Limpiar tokens expirados del usuario (opcional, para mantener limpia la DB)
    await this.refreshTokenRepository.delete({
      userId,
      expiresAt: LessThan(new Date()),
    });

    return token;
  }

  async register(data: RegisterUserDto) {
    if (!data.siteId) {
      throw new BadRequestException('El registro de usuarios requiere especificar un site_id');
    }

    return await this.userRepository.manager.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const roleRepo = manager.getRepository(Role);
      const userSiteRepo = manager.getRepository(UserSite);
      const userSiteRoleRepo = manager.getRepository(UserSiteRole);
      const siteRepo = manager.getRepository(Site);

      // Verificar si el usuario ya existe
      const existingUser = await userRepo.findOne({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('El email ya está registrado');
      }

      // Buscar el rol
      const role = await roleRepo.findOne({
        where: { code: data.roleCode, isActive: true },
      });

      if (!role) {
        throw new BadRequestException('Rol no válido');
      }

      // Verificar site
      const site = await siteRepo.findOne({
        where: { siteId: data.siteId, isActive: true },
      });
      if (!site) {
        throw new BadRequestException('Sede no válida');
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Crear usuario
      const user = userRepo.create({
        email: data.email,
        passwordHash,
      });

      const savedUser = await userRepo.save(user);

      const userSite = userSiteRepo.create({
        userId: savedUser.id,
        siteId: data.siteId,
        isActive: true,
      });
      await userSiteRepo.save(userSite);

      const userSiteRole = userSiteRoleRepo.create({
        userId: savedUser.id,
        siteId: data.siteId,
        roleId: role.id,
      });
      await userSiteRoleRepo.save(userSiteRole);

      const { passwordHash: _passwordHash, ...safeUser } = savedUser as unknown as {
        passwordHash?: string;
        [key: string]: any;
      };
      return safeUser;
    });
  }

  async login(data: LoginUserDto, ipAddress: string | null = null, userAgent: string | null = null) {
    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { email: data.email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener sites del usuario
    const userSites = await this.userSiteRepository
      .createQueryBuilder('us')
      .leftJoinAndSelect('us.site', 'site')
      .where('us.userId = :userId', { userId: user.id })
      .andWhere('us.isActive = true')
      .andWhere('site.isActive = true')
      .getMany();

    if (userSites.length === 0) {
      // Usar mensaje genérico para no revelar que el usuario existe
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener roles y permisos de todos los sites
    const userSiteRoles = await this.userSiteRoleRepository
      .createQueryBuilder('usr')
      .leftJoinAndSelect('usr.role', 'role')
      .leftJoinAndSelect('usr.site', 'site')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .where('usr.userId = :userId', { userId: user.id })
      .andWhere('role.isActive = true')
      .getMany();

    if (userSiteRoles.length === 0) {
      throw new UnauthorizedException('El usuario no tiene roles asignados. Contacte con el administrador.');
    }

    const roles = [...new Set(userSiteRoles.map((usr) => usr.role.code))];
    const permissions = [...new Set(userSiteRoles.flatMap((usr) =>
      usr.role.rolePermissions
        .filter((rp) => rp.permission.isActive)
        .map((rp) => rp.permission.code)
    ))];
    
    const sites = userSites.map(us => ({
      siteId: us.site.siteId,
      code: us.site.code,
      name: us.site.name,
    }));

    // Generar access token (1 hora)
    const token = this.generateAccessToken({
      userId: user.id,
      userName: user.userName,
      email: user.email,
      roles,
      permissions,
      sites,
    });

    // Generar refresh token (7 días)
    const refreshToken = await this.generateRefreshToken(user.id, ipAddress, userAgent);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        roles,
        permissions,
        sites,
      },
    };
  }

  async refreshAccessToken(refreshTokenStr: string): Promise<{ token: string; refreshToken: string }> {
    // Buscar refresh token en DB
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenStr, isRevoked: false },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Verificar si expiró
    if (new Date() > refreshToken.expiresAt) {
      await this.refreshTokenRepository.delete({ token: refreshTokenStr });
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Verificar que el usuario siga activo
    if (!refreshToken.user.isActive) {
      await this.revokeRefreshToken(refreshTokenStr);
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Obtener datos actualizados del usuario
    const userSites = await this.userSiteRepository
      .createQueryBuilder('us')
      .leftJoinAndSelect('us.site', 'site')
      .where('us.userId = :userId', { userId: refreshToken.userId })
      .andWhere('us.isActive = true')
      .andWhere('site.isActive = true')
      .getMany();

    const userSiteRoles = await this.userSiteRoleRepository
      .createQueryBuilder('usr')
      .leftJoinAndSelect('usr.role', 'role')
      .leftJoinAndSelect('usr.site', 'site')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .where('usr.userId = :userId', { userId: refreshToken.userId })
      .andWhere('role.isActive = true')
      .andWhere('permission.isActive = true')
      .getMany();

    const roles = [...new Set(userSiteRoles.map((usr) => usr.role.code))];
    const permissions = [...new Set(userSiteRoles.flatMap((usr) =>
      usr.role.rolePermissions.map((rp) => rp.permission.code)
    ))];
    
    const sites = userSites.map(us => ({
      siteId: us.site.siteId,
      code: us.site.code,
      name: us.site.name,
    }));

    // Generar nuevo access token
    const newAccessToken = this.generateAccessToken({
      userId: refreshToken.user.id,
      userName: refreshToken.user.userName,
      email: refreshToken.user.email,
      roles,
      permissions,
      sites,
    });

    // Generar nuevo refresh token (rotación de tokens)
    const newRefreshToken = await this.generateRefreshToken(
      refreshToken.userId,
      refreshToken.ipAddress,
      refreshToken.userAgent,
    );

    // Revocar el refresh token anterior
    await this.revokeRefreshToken(refreshTokenStr);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { isRevoked: true },
    );
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Obtener sites del usuario
    const userSites = await this.userSiteRepository
      .createQueryBuilder('us')
      .leftJoinAndSelect('us.site', 'site')
      .where('us.userId = :userId', { userId })
      .andWhere('us.isActive = true')
      .andWhere('site.isActive = true')
      .getMany();

    // Obtener roles y permisos
    const userSiteRoles = await this.userSiteRoleRepository
      .createQueryBuilder('usr')
      .leftJoinAndSelect('usr.role', 'role')
      .leftJoinAndSelect('usr.site', 'site')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission')
      .where('usr.userId = :userId', { userId })
      .andWhere('role.isActive = true')
      .andWhere('permission.isActive = true')
      .getMany();

    const roles = [...new Set(userSiteRoles.map((usr) => usr.role.code))];
    const permissions = [...new Set(userSiteRoles.flatMap((usr) =>
      usr.role.rolePermissions.map((rp) => rp.permission.code)
    ))];
    
    const sites = userSites.map(us => ({
      siteId: us.site.siteId,
      code: us.site.code,
      name: us.site.name,
    }));

    return {
      id: user.id,
      email: user.email,
      roles,
      permissions,
      sites,
    };
  }

  async refreshSession(userId: number) {
    // Buscar usuario
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    // Obtener roles, permisos y sites actualizados (misma lógica que login)
    const userSiteRoles = await this.userSiteRoleRepository.find({
      where: { userId: user.id },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission', 'site'],
    });

    if (userSiteRoles.length === 0) {
      throw new UnauthorizedException('Usuario sin roles asignados en ningún site');
    }

    const roles = [...new Set(userSiteRoles.map(usr => usr.role.code))];
    const permissionsSet = new Set<string>();

    userSiteRoles.forEach(usr => {
      usr.role.rolePermissions.forEach(rp => {
        if (rp.permission.isActive) {
          permissionsSet.add(rp.permission.code);
        }
      });
    });

    const permissions = Array.from(permissionsSet);

    const userSites = await this.userSiteRepository.find({
      where: { userId: user.id, isActive: true },
      relations: ['site'],
    });

    const sites = userSites.map(us => ({
      siteId: us.site.siteId,
      code: us.site.code,
      name: us.site.name,
    }));

    // Generar nuevo access token
    const token = this.generateAccessToken({
      userId: user.id,
      userName: user.userName,
      email: user.email,
      roles,
      permissions,
      sites,
    });

    return {
      token,
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        roles,
        permissions,
        sites,
      },
    };
  }
}
