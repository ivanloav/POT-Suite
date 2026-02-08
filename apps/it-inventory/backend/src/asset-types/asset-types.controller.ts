import { Controller, Get, Post, Body, UseGuards, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetTypesService } from './asset-types.service';
import { CreateAssetTypeDto, UpdateAssetTypeDto } from './dto/asset-type.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Asset-Types')
@Controller('asset-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetTypesController {
  constructor(private readonly assetTypesService: AssetTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de activos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos' })
  async getAll() {
    const data = await this.assetTypesService.getAll();
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo tipo' })
  @ApiResponse({ status: 201, description: 'Tipo creado' })
  async create(@Body() dto: CreateAssetTypeDto, @Request() req: RequestWithUser) {
    const result = await this.assetTypesService.create(dto, req.user.userId);
    return {
      message: 'Tipo de activo creado exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar tipos a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetTypesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-types.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetTypesService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-types-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar tipos desde Excel' })
  @ApiResponse({ status: 200, description: 'Tipos importados' })
  async importFromExcel(
    @UploadedFile() file: any,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporcionó ningún archivo',
      };
    }

    const result = await this.assetTypesService.importFromExcel(file.buffer, req.user.userId);

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
    const result = await this.assetTypesService.updateDuplicatesFromExcel(body.duplicates);

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
    const data = await this.assetTypesService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar tipo' })
  @ApiResponse({ status: 200, description: 'Tipo actualizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetTypeDto,
    @Request() req: RequestWithUser
  ) {
    const result = await this.assetTypesService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Tipo de activo actualizado exitosamente',
      data: result,
    };
  }
}
