import { Controller, Get, Post, Body, UseGuards, Query, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetModelsService } from './asset-models.service';
import { CreateAssetModelDto, UpdateAssetModelDto } from './dto/asset-model.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('asset-models')
@Controller('asset-models')
@ApiBearerAuth()
export class AssetModelsController {
  constructor(private readonly assetModelsService: AssetModelsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar modelos de activos' })
  @ApiQuery({ name: 'typeId', required: false, type: Number, description: 'Filtrar por tipo de activo' })
  @ApiQuery({ name: 'brandId', required: false, type: Number, description: 'Filtrar por marca de activo' })
  @ApiResponse({ status: 200, description: 'Lista de modelos de activos' })
  async getAssetModels(
    @Query('typeId') typeId?: number,
    @Query('brandId') brandId?: number,
  ) {
    const data = await this.assetModelsService.getAssetModels(
      typeId ? Number(typeId) : undefined,
      brandId ? Number(brandId) : undefined,
    );
    return { data };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo modelo de activo' })
  @ApiResponse({ status: 201, description: 'Modelo creado' })
  async createAssetModel(@Body() dto: CreateAssetModelDto, @Request() req: RequestWithUser) {
    const userId = req.user.userId;
    const data = { ...dto, createdBy: userId };
    const result = await this.assetModelsService.createAssetModel(data);
    return {
      message: 'Modelo de activo creado exitosamente',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener modelo de activo por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del modelo de activo' })
  async getAssetModelById(@Param('id') id: string) {
    const data = await this.assetModelsService.getAssetModelById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar modelo de activo' })
  @ApiResponse({ status: 200, description: 'Modelo actualizado' })
  async updateAssetModel(@Param('id') id: string, @Body() dto: UpdateAssetModelDto, @Request() req: RequestWithUser) {
    const userId = req.user.userId;
    const data = { ...dto, updatedBy: userId };
    const result = await this.assetModelsService.updateAssetModel(parseInt(id), data);
    return {
      message: 'Modelo de activo actualizado exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar modelos de activo a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetModelsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-models.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar plantilla de Excel para importar' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetModelsService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-models-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar modelos de activo desde Excel' })
  @ApiResponse({ status: 200, description: 'Modelos importados' })
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

    const userId = req.user.userId;
    const result = await this.assetModelsService.importFromExcel(file.buffer, userId);

    return {
      success: result.errores.length === 0 && result.duplicados.length === 0,
      message: result.duplicados.length > 0 
        ? `${result.insertados} modelos insertados. ${result.duplicados.length} duplicados detectados.`
        : `Importación completada: ${result.insertados} modelos creados`,
      data: result,
    };
  }

  @Post('update-duplicates-excel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar modelos duplicados desde Excel' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.assetModelsService.updateDuplicatesFromExcel(body.duplicates);
    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} modelos actualizados`,
      data: result,
    };
  }
}
