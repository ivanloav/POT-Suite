import { Controller, Get, Post, Body, UseGuards, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetStatusesService } from './asset-statuses.service';
import { CreateAssetStatusDto, UpdateAssetStatusDto } from './dto/asset-status.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Asset-Statuses')
@Controller('asset-statuses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetStatusesController {
  constructor(private readonly assetStatusesService: AssetStatusesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estados de activos' })
  @ApiResponse({ status: 200, description: 'Lista de estados' })
  async getAll() {
    const data = await this.assetStatusesService.getAll();
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo estado' })
  @ApiResponse({ status: 201, description: 'Estado creado' })
  async create(@Body() dto: CreateAssetStatusDto, @Request() req: RequestWithUser) {
    const result = await this.assetStatusesService.create(dto, req.user.userId);
    return {
      message: 'Estado de activo creado exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar estados a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetStatusesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-statuses.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetStatusesService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-statuses-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar estados desde Excel' })
  @ApiResponse({ status: 200, description: 'Estados importados' })
  async importFromExcel(@UploadedFile() file: any) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporcionó ningún archivo',
      };
    }

    const result = await this.assetStatusesService.importFromExcel(file.buffer);

    let message = '';
    if (result.insertados > 0 && result.duplicados.length > 0) {
      message = `${result.insertados} estados insertados. ${result.duplicados.length} duplicados detectados.`;
    } else if (result.insertados > 0) {
      message = `${result.insertados} estados insertados exitosamente`;
    } else if (result.duplicados.length > 0) {
      message = `${result.duplicados.length} duplicados detectados. No se insertaron nuevos estados.`;
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
  @ApiOperation({ summary: 'Actualizar estados duplicados' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.assetStatusesService.updateDuplicatesFromExcel(body.duplicates);

    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} estados actualizados`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estado por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del estado' })
  async getById(@Param('id') id: string) {
    const data = await this.assetStatusesService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estado' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetStatusDto,
    @Request() req: RequestWithUser
  ) {
    const result = await this.assetStatusesService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Estado de activo actualizado exitosamente',
      data: result,
    };
  }
}
