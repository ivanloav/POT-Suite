import { Controller, Post, Get, Body, Request, UseGuards, UnauthorizedException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { LoginAttempt } from '../entities/login-attempt.entity';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // Rate limiting: 5 intentos por IP cada 15 minutos
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION = 15 * 60 * 1000; // 15 minutos
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // Limpiar cada hora

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(LoginAttempt)
    private readonly loginAttemptRepository: Repository<LoginAttempt>,
  ) {
    // Limpieza automática de intentos antiguos cada hora
    setInterval(() => this.cleanupOldAttempts(), this.CLEANUP_INTERVAL);
  }

  private async cleanupOldAttempts() {
    const cutoffDate = new Date(Date.now() - this.BLOCK_DURATION);
    await this.loginAttemptRepository.delete({
      lastAttempt: LessThan(cutoffDate),
    });
  }

  private getClientIp(req: any): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0].trim();
    }
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  private async checkRateLimit(ip: string): Promise<void> {
    const now = new Date();
    const attempt = await this.loginAttemptRepository.findOne({ where: { ip } });

    if (!attempt) {
      return; // Primera vez, permitir
    }

    // Si está bloqueado, verificar si ya pasó el tiempo
    if (attempt.blockedUntil && now < attempt.blockedUntil) {
      const remainingMinutes = Math.ceil((attempt.blockedUntil.getTime() - now.getTime()) / 60000);
      throw new UnauthorizedException(
        `Demasiados intentos fallidos. Intente nuevamente en ${remainingMinutes} minuto(s)`
      );
    }

    // Si pasó el tiempo de bloqueo, resetear
    if (attempt.blockedUntil && now >= attempt.blockedUntil) {
      await this.loginAttemptRepository.delete({ ip });
      return;
    }

    // Si tiene muchos intentos en el período, bloquear
    const timeSinceLastAttempt = now.getTime() - attempt.lastAttempt.getTime();
    if (attempt.count >= this.MAX_ATTEMPTS && timeSinceLastAttempt < this.BLOCK_DURATION) {
      attempt.blockedUntil = new Date(now.getTime() + this.BLOCK_DURATION);
      await this.loginAttemptRepository.save(attempt);
      throw new UnauthorizedException(
        `Demasiados intentos fallidos. Intente nuevamente en 15 minutos`
      );
    }

    // Si pasaron más de 15 minutos desde el último intento, resetear contador
    if (timeSinceLastAttempt > this.BLOCK_DURATION) {
      await this.loginAttemptRepository.delete({ ip });
    }
  }

  private async recordFailedAttempt(ip: string): Promise<void> {
    const now = new Date();
    let attempt = await this.loginAttemptRepository.findOne({ where: { ip } });

    if (!attempt) {
      attempt = this.loginAttemptRepository.create({
        ip,
        count: 1,
        lastAttempt: now,
        blockedUntil: null,
      });
    } else {
      attempt.count++;
      attempt.lastAttempt = now;
    }

    await this.loginAttemptRepository.save(attempt);
  }

  private async clearAttempts(ip: string): Promise<void> {
    await this.loginAttemptRepository.delete({ ip });
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario ya existe' })
  async register(@Body() dto: RegisterUserDto) {
    const result = await this.authService.register(dto);
    return {
      message: 'Usuario registrado exitosamente',
      data: result,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos fallidos' })
  async login(@Body() dto: LoginUserDto, @Request() req: any, @Res({ passthrough: true }) res: Response) {
    const clientIp = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || null;

    // Verificar rate limit ANTES de intentar login
    await this.checkRateLimit(clientIp);

    try {
      const result = await this.authService.login(dto, clientIp, userAgent);

      const isProd = process.env.NODE_ENV === 'production';
      const sameSite = isProd ? 'strict' : 'lax';
      // Limpia cookies antiguas con path anterior
      res.clearCookie('refresh_token', { path: '/api/auth' });
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      // Login exitoso: limpiar intentos fallidos
      await this.clearAttempts(clientIp);
      
      return { token: result.token, user: result.user };
    } catch (error) {
      // Login fallido: registrar intento
      await this.recordFailedAttempt(clientIp);
      
      // Re-lanzar el error original
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@Request() req: any) {
    const userId = req.user.userId;
    const result = await this.authService.getProfile(userId);
    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  async refresh(@Body() body: { refreshToken?: string }, @Request() req: any, @Res({ passthrough: true }) res: Response) {
    try {
      const refreshToken = body.refreshToken || req.cookies?.refresh_token;
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token no proporcionado');
      }
      const result = await this.authService.refreshAccessToken(refreshToken);

      const isProd = process.env.NODE_ENV === 'production';
      const sameSite = isProd ? 'strict' : 'lax';
      // Limpia cookies antiguas con path anterior
      res.clearCookie('refresh_token', { path: '/api/auth' });
      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return { token: result.token };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al renovar token';
      throw new UnauthorizedException(message);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (revocar refresh token)' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Body() body: { refreshToken?: string } = {}, @Request() req: any, @Res({ passthrough: true }) res: Response) {
    const userId = req.user.userId;

    const refreshToken = body?.refreshToken || req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie('refresh_token', { path: '/api/auth' });
    res.clearCookie('refresh_token', { path: '/' });
    
    // Opcional: revocar todos los tokens del usuario
    // await this.authService.revokeAllUserTokens(userId);
    
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Get('refresh-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refrescar sesión actual (regenerar JWT con datos actualizados)' })
  @ApiResponse({ status: 200, description: 'Sesión refrescada exitosamente' })
  async refreshSession(@Request() req: any) {
    const userId = req.user.userId;
    const result = await this.authService.refreshSession(userId);
    return result;
  }
}
