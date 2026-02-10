import { Body, Controller, Get, Param, Post, Put, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { AssetMaintenanceTypesService } from './asset-maintenance-types.service';
import { CreateAssetMaintenanceTypeDto, UpdateAssetMaintenanceTypeDto } from './dto/asset-maintenance-type.dto';

@ApiTags('Asset Maintenance Types')
@Controller('asset-maintenance-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetMaintenanceTypesController {
  constructor(private readonly maintenanceTypesService: AssetMaintenanceTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de mantenimiento' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de tipos' })
  async getAll(@Query('isActive') isActive?: string) {
    const data = await this.maintenanceTypesService.getAll({
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo de mantenimiento' })
  @ApiResponse({ status: 201, description: 'Tipo creado' })
  async create(@Body() dto: CreateAssetMaintenanceTypeDto, @Request() req: RequestWithUser) {
    const result = await this.maintenanceTypesService.create(dto, req.user.userId);
    return {
      message: 'Tipo de mantenimiento creado exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar tipos a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.maintenanceTypesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-maintenance-types.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.maintenanceTypesService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-maintenance-types-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar tipos desde Excel' })
  @ApiResponse({ status: 200, description: 'Tipos importados' })
  async importFromExcel(@UploadedFile() file: any) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporciono ningun archivo',
      };
    }

    const result = await this.maintenanceTypesService.importFromExcel(file.buffer);

    let message = '';
    if (result.insertados > 0 && result.duplicados.length > 0) {
      message = `${result.insertados} tipos insertados. ${result.duplicados.length} duplicados detectados.`;
    } else if (result.insertados > 0) {
      message = `${result.insertados} tipos insertados exitosamente`;
    } else if (result.duplicados.length > 0) {
      message = `${result.duplicados.length} duplicados detectados. No se insertaron nuevos tipos.`;
    } else {
      message = 'No se procesaron registros';
    }

    return {
      success: result.duplicados.length === 0 && result.errores.length === 0,
      message,
      data: result,
    };
  }

  @Post('update-duplicates-excel')
  @ApiOperation({ summary: 'Actualizar tipos duplicados' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.maintenanceTypesService.updateDuplicatesFromExcel(body.duplicates);

    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} tipos actualizados`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del tipo' })
  async getById(@Param('id') id: string) {
    const data = await this.maintenanceTypesService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar tipo de mantenimiento' })
  @ApiResponse({ status: 200, description: 'Tipo actualizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetMaintenanceTypeDto,
    @Request() req: RequestWithUser,
  ) {
    const result = await this.maintenanceTypesService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Tipo de mantenimiento actualizado exitosamente',
      data: result,
    };
  }
}
