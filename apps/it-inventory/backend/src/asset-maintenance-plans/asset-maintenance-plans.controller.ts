import { Body, Controller, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { AssetMaintenancePlansService } from './asset-maintenance-plans.service';
import { CompleteAssetMaintenanceDto, CreateAssetMaintenancePlanDto, UpdateAssetMaintenancePlanDto } from './dto/asset-maintenance-plan.dto';
import { Response } from 'express';

@ApiTags('Asset Maintenance Plans')
@Controller('asset-maintenance-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetMaintenancePlansController {
  constructor(private readonly plansService: AssetMaintenancePlansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar planes de mantenimiento' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiQuery({ name: 'assetId', required: false, type: Number })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de planes' })
  async getAll(
    @Query('siteId') siteId?: string,
    @Query('assetId') assetId?: string,
    @Query('isActive') isActive?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.plansService.getAll({
      siteId: siteId ? parseInt(siteId) : undefined,
      assetId: assetId ? parseInt(assetId) : undefined,
      isActive: isActive === undefined ? undefined : isActive === 'true',
      from,
      to,
    });
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear plan de mantenimiento' })
  @ApiResponse({ status: 201, description: 'Plan creado' })
  async create(@Body() dto: CreateAssetMaintenancePlanDto, @Request() req: RequestWithUser) {
    const result = await this.plansService.create(dto, req.user.userId);
    return {
      message: 'Plan de mantenimiento creado exitosamente',
      data: result,
    };
  }

  @Post('import-excel')
  @ApiOperation({ summary: 'Importar planes desde Excel' })
  @ApiResponse({ status: 201, description: 'Planes importados' })
  async importFromExcel(@Body('plans') plans: any[], @Request() req: RequestWithUser) {
    const result = await this.plansService.importFromExcel(plans, req.user.userId);
    return {
      message: 'Planes importados exitosamente',
      data: result,
    };
  }

  @Post('import-excel/update-duplicates')
  @ApiOperation({ summary: 'Actualizar planes duplicados de importación' })
  @ApiResponse({ status: 200, description: 'Planes actualizados' })
  async updateDuplicatesFromExcel(@Body('duplicates') duplicates: any[], @Request() req: RequestWithUser) {
    const result = await this.plansService.updateDuplicatesFromExcel(duplicates, req.user.userId);
    return {
      message: 'Planes actualizados exitosamente',
      data: result,
    };
  }

  @Post('apply-to-assets')
  @ApiOperation({ summary: 'Aplicar plan a múltiples activos' })
  @ApiResponse({ status: 201, description: 'Planes creados para múltiples activos' })
  async applyToMultipleAssets(
    @Body() body: { planId: number; assetIds: number[] },
    @Request() req: RequestWithUser,
  ) {
    const result = await this.plansService.applyToMultipleAssets(body.planId, body.assetIds, req.user.userId);
    return {
      message: `Plan aplicado a ${result.length} activos exitosamente`,
      data: result,
    };
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla Excel para importación' })
  @ApiResponse({ status: 200, description: 'Plantilla descargada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.plansService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="plantilla-mantenimientos-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Marcar mantenimiento como realizado' })
  @ApiResponse({ status: 200, description: 'Mantenimiento registrado' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteAssetMaintenanceDto,
    @Request() req: RequestWithUser,
  ) {
    const result = await this.plansService.complete(parseInt(id), dto, req.user.userId);
    return {
      message: 'Mantenimiento registrado exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar planes de mantenimiento a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.plansService.exportToExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="mantenimientos-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plan por ID' })
  @ApiResponse({ status: 200, description: 'Detalle del plan' })
  async getById(@Param('id') id: string) {
    const data = await this.plansService.getById(parseInt(id));
    return { data };
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar plan de mantenimiento' })
  @ApiResponse({ status: 201, description: 'Plan duplicado' })
  async duplicate(@Param('id') id: string, @Request() req: RequestWithUser) {
    const result = await this.plansService.duplicate(parseInt(id), req.user.userId);
    return {
      message: 'Plan duplicado exitosamente',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar plan de mantenimiento' })
  @ApiResponse({ status: 200, description: 'Plan actualizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetMaintenancePlanDto,
    @Request() req: RequestWithUser,
  ) {
    const result = await this.plansService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Plan de mantenimiento actualizado exitosamente',
      data: result,
    };
  }
}
