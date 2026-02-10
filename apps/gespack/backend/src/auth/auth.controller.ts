/**
 * Controlador de autenticación.
 * 
 * Gestiona el inicio y cierre de sesión, así como la recuperación del usuario actual a partir del JWT.
 * Utiliza cookies httpOnly para mantener la sesión y protege las rutas mediante el guard JwtAuthGuard.
 * 
 * Endpoints:
 * - POST /auth/login → Verifica credenciales y devuelve JWT en cookie.
 * - GET /auth/me → Devuelve información del usuario autenticado si el JWT es válido.
 * - POST /auth/logout → Elimina la cookie JWT.
 */
import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { buildResponse, buildErrorResponse } from 'src/shared/utils/response-builder';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Valida credenciales y envía JWT en cookie httpOnly.' })
  @ApiResponse({ status: 200, description: 'Login correcto' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @I18n() i18n: I18nContext,
  ) {
    const result = await this.authService.login(loginDto);

    if (!result.success) {
      return buildErrorResponse(await i18n.t('auth.credentials_invalid'));
    }

    // ⚠️ Importante para que funcione con localhost, IP y DNS: NO establecer 'domain'.
    // Deja la cookie como host-only; así el navegador la guarda también si entras por :8080.
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,    // ponlo en true cuando sirvas por HTTPS
      path: '/',        // accesible en toda la app
      // maxAge opcional (por ejemplo, 1h si tu token expira en 1h):
      // maxAge: 60 * 60 * 1000,
    });

    // No expongas campos sensibles
    const { userPassword, password, salt, ...safeUser } = (result.user || {}) as any;

    return buildResponse({ user: safeUser }, await i18n.t('auth.login_success'));
  }

  @Post('suite-login')
  @ApiOperation({ summary: 'Login Operations Hub', description: 'Valida credenciales en auth.users y envía JWT en cookie httpOnly.' })
  async suiteLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const result = await this.authService.loginSuite(loginDto);

    if (!result.success) {
      return buildErrorResponse(await i18n.t('auth.credentials_invalid'));
    }

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return buildResponse(
      { user: result.user, apps: result.apps ?? [] },
      await i18n.t('auth.login_success'),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Usuario actual', description: 'Devuelve el usuario si el JWT en cookie es válido.' })
  async me(@Req() req: Request, @I18n() i18n: I18nContext) {
    const token = req.cookies?.['access_token'];
    if (!token) {
      throw new UnauthorizedException(await i18n.t('auth.no_token'));
    }
    try {
      const payload = this.jwtService.verify(token);
      return buildResponse({
        authenticated: true,
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
      }, await i18n.t('auth.user_data'));
    } catch {
      throw new UnauthorizedException(await i18n.t('auth.invalid_token'));
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('apps')
  @ApiOperation({ summary: 'Apps disponibles', description: 'Devuelve las apps habilitadas para el usuario.' })
  async apps(@Req() req: Request, @I18n() i18n: I18nContext) {
    const email = ((req as Request & { user?: any }).user)?.email;
    const apps = await this.authService.getAppsForEmail(email);
    return buildResponse({ apps }, await i18n.t('auth.user_data'));
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión', description: 'Elimina la cookie httpOnly con el JWT.' })
  async logout(@Res({ passthrough: true }) res: Response, @I18n() i18n: I18nContext) {
    res.clearCookie('access_token', {path: '/'});
    res.clearCookie('selectedSite', { path: '/' });
    return buildResponse(null, await i18n.t('auth.logout_success'));
  }
}
