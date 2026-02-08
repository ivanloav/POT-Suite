import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { AssetMaintenanceRecordsService } from './asset-maintenance-records.service';

@ApiTags('Asset Maintenance Records')
@Controller('asset-maintenance-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetMaintenanceRecordsController {
  constructor(private readonly recordsService: AssetMaintenanceRecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros de mantenimiento' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiQuery({ name: 'assetId', required: false, type: Number })
  @ApiQuery({ name: 'planId', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de registros' })
  async getAll(
    @Query('siteId') siteId?: string,
    @Query('assetId') assetId?: string,
    @Query('planId') planId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.recordsService.getAll({
      siteId: siteId ? parseInt(siteId) : undefined,
      assetId: assetId ? parseInt(assetId) : undefined,
      planId: planId ? parseInt(planId) : undefined,
      from,
      to,
    });
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del registro' })
  async getById(@Param('id') id: string) {
    const data = await this.recordsService.getById(parseInt(id));
    return { data };
  }
}
