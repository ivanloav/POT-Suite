import { Controller, Get, Post, Body, UseGuards, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetBrandsService } from './asset-brands.service';
import { CreateAssetBrandDto, UpdateAssetBrandDto } from './dto/asset-brand.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Asset-Brands')
@Controller('asset-brands')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetBrandsController {
  constructor(private readonly assetBrandsService: AssetBrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar marcas de activos' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async getAll() {
    const data = await this.assetBrandsService.getAll();
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva marca' })
  @ApiResponse({ status: 201, description: 'Marca creada' })
  async create(@Body() dto: CreateAssetBrandDto, @Request() req: RequestWithUser) {
    const result = await this.assetBrandsService.create(dto, req.user.userId);
    return {
      message: 'Marca creada exitosamente',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener marca por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la marca' })
  async getById(@Param('id') id: string) {
    const data = await this.assetBrandsService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar marca' })
  @ApiResponse({ status: 200, description: 'Marca actualizada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetBrandDto,
    @Request() req: RequestWithUser
  ) {
    const result = await this.assetBrandsService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Marca actualizada exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar marcas a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetBrandsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-brands.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel para importar' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetBrandsService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-brands-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar marcas desde Excel' })
  @ApiResponse({ status: 200, description: 'Marcas importadas' })
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

    const result = await this.assetBrandsService.importFromExcel(file.buffer, req.user.userId);

    let message = '';
    if (result.insertados > 0 && result.duplicados.length > 0) {
      message = `${result.insertados} marcas insertadas. ${result.duplicados.length} duplicados detectados.`;
    } else if (result.insertados > 0) {
      message = `${result.insertados} marcas insertadas exitosamente`;
    } else if (result.duplicados.length > 0) {
      message = `${result.duplicados.length} duplicados detectados. No se insertaron nuevas marcas.`;
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
  @ApiOperation({ summary: 'Actualizar marcas duplicadas después de confirmación' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.assetBrandsService.updateDuplicatesFromExcel(body.duplicates);

    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} marcas actualizadas`,
      data: result,
    };
  }
}
