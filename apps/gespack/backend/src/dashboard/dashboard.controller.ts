// backend/src/dashboard/dashboard.controller.ts
import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SiteGuard } from 'src/shared/guards/site.guard';
import { SiteId } from 'src/shared/decorators/site-id.decorator';
import { UserId } from 'src/shared/decorators/user-id.decorator';
import { buildResponse, buildErrorResponse } from 'src/shared/utils/response-builder';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DashboardConfigService } from './dashboard-config.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    isAdmin: boolean;
  };
}

@ApiTags('Dashboard')
@UseGuards(JwtAuthGuard, SiteGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly configService: DashboardConfigService
  ) {}

  @ApiOperation({ summary: 'Obtener datos para las cards del dashboard' })
  @Get('kpis')
  async getKpis(@SiteId() siteId: number, @UserId() userId: number, @I18n() i18n: I18nContext) {
    try {
      const data = await this.dashboardService.getKpis(siteId ?? 0, userId);
      return buildResponse(data, await i18n.t('dashboard.kpis_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('dashboard.error_kpis'), error);
    }
  }

  @ApiOperation({ summary: 'Obtener configuración de dashboard personalizada' })
  @Get('config')
  async getDashboardConfig(
    @Req() req: AuthenticatedRequest,
    @Query('site_id') siteId: number,
    @I18n() i18n: I18nContext
  ) {
    try {
      const userId = req.user.userId;
      const config = await this.configService.getConfig(userId, siteId);
      
      const response = {
        cardOrder: config || [
          'pending-invoicing',
          'products-pending', 
          'out-of-stock',
          'recorded',
          'pending-payment',
          'invoiced'
        ]
      };
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Guardar configuración de dashboard personalizada' })
  @Post('config')
  async saveDashboardConfig(
    @Req() req: AuthenticatedRequest,
    @Body() body: { site_id: number; card_order: string[] },
    @I18n() i18n: I18nContext
  ) {
    try {
      const userId = req.user.userId;
      const config = await this.configService.saveConfig(
        userId, 
        body.site_id, 
        body.card_order
      );
      
      const response = {
        message: 'Configuración guardada',
        config
      };
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ summary: 'Restablecer configuración de dashboard a valores por defecto' })
  @Delete('config')
  async resetDashboardConfig(
    @Req() req: AuthenticatedRequest,
    @Query('site_id') siteId: number,
    @I18n() i18n: I18nContext
  ) {
    try {
      const userId = req.user.userId;
      await this.configService.resetConfig(userId, siteId);
        
      return {message: 'Configuración restablecida'};
    } catch (error) {
      throw error;
    }
  }
}