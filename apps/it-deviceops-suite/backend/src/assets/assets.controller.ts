
import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Res, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, RetireAssetDto } from './dto/asset.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { AssetStatus } from '../entities/asset-status.entity';
import { Response } from 'express';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('import-excel')
  @ApiOperation({ summary: 'Importar activos por Excel' })
  @ApiResponse({ status: 201, description: 'Activos importados exitosamente' })
  async importAssetsFromExcel(@Body('assets') assets: any[], @Request() req: RequestWithUser) {
    const result = await this.assetsService.importFromExcel(assets, req.user.userId);
    return {
      message: 'Activos importados exitosamente',
      data: result,
    };
  }

  @Post('import-excel/update-duplicates')
  @ApiOperation({ summary: 'Actualizar activos duplicados de importación' })
  @ApiResponse({ status: 200, description: 'Activos actualizados exitosamente' })
  async updateDuplicatesFromExcel(@Body('duplicates') duplicates: any[], @Request() req: RequestWithUser) {
    const result = await this.assetsService.updateDuplicatesFromExcel(duplicates, req.user.userId);
    return {
      message: 'Activos actualizados exitosamente',
      data: result,
    };
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla Excel para importación de activos' })
  @ApiResponse({ status: 200, description: 'Plantilla descargada exitosamente' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetsService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="assets-template-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los activos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: AssetStatus })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de activos' })
  async getAssets(@Query() query: any) {
    const result = await this.assetsService.findAll(query);
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un activo por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del activo' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado' })
  async getAssetById(@Param('id') id: string) {
    const data = await this.assetsService.findOne(parseInt(id));
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo activo' })
  @ApiResponse({ status: 201, description: 'Activo creado exitosamente' })
  async createAsset(@Body() dto: CreateAssetDto, @Request() req: RequestWithUser) {
    const result = await this.assetsService.create(dto, req.user.userId);
    return {
      message: 'Activo creado exitosamente',
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un activo' })
  @ApiResponse({ status: 200, description: 'Activo actualizado' })
  async updateAsset(@Param('id') id: string, @Body() dto: UpdateAssetDto, @Request() req: RequestWithUser) {
    const result = await this.assetsService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Activo actualizado exitosamente',
      data: result,
    };
  }

  @Post(':id/retire')
  @ApiOperation({ summary: 'Retirar un activo del servicio' })
  @ApiResponse({ status: 200, description: 'Activo retirado' })
  async retireAsset(@Param('id') id: string, @Body() dto: RetireAssetDto, @Request() req: RequestWithUser) {
    const result = await this.assetsService.retire(parseInt(id), dto, req.user.userId);
    return {
      message: 'Activo retirado exitosamente',
      data: result,
    };
  }
}
