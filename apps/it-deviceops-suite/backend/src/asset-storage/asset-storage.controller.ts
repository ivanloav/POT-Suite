import { Controller, Get, Post, Body, UseGuards, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetStorageService } from './asset-storage.service';
import { CreateAssetStorageDto, UpdateAssetStorageDto } from './dto/asset-storage.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('asset-storage')
@Controller('asset-storage')
@ApiBearerAuth()
export class AssetStorageController {
  constructor(private readonly assetStorageService: AssetStorageService) {}

  @Get()
  @ApiOperation({ summary: 'Listar opciones de almacenamiento' })
  @ApiResponse({ status: 200, description: 'Lista de opciones de almacenamiento' })
  async getAll() {
    const data = await this.assetStorageService.getAll();
    return { data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear nueva opción de almacenamiento' })
  @ApiResponse({ status: 201, description: 'Almacenamiento creado' })
  async create(@Body() dto: CreateAssetStorageDto, @Request() req: RequestWithUser) {
    const userId = req.user.userId;
    const data = await this.assetStorageService.create(dto, userId);
    return {
      message: 'Opción de almacenamiento creada exitosamente',
      data,
    };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Exportar almacenamiento a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetStorageService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-storage.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Descargar plantilla de Excel para importar almacenamiento' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetStorageService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-storage-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar almacenamiento desde Excel' })
  @ApiResponse({ status: 200, description: 'Almacenamiento importado' })
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
    const result = await this.assetStorageService.importFromExcel(file.buffer, userId);

    return {
      success: result.errores.length === 0 && result.duplicados.length === 0,
      message: result.duplicados.length > 0 
        ? `${result.insertados} opciones insertadas. ${result.duplicados.length} duplicados detectados.`
        : `Importación completada: ${result.insertados} opciones creadas`,
      data: result,
    };
  }

  @Post('update-duplicates-excel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar almacenamiento duplicado desde Excel' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.assetStorageService.updateDuplicatesFromExcel(body.duplicates);
    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} opciones actualizadas`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener almacenamiento por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del almacenamiento' })
  async getById(@Param('id') id: string) {
    const data = await this.assetStorageService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar almacenamiento' })
  @ApiResponse({ status: 200, description: 'Almacenamiento actualizado' })
  async update(@Param('id') id: string, @Body() dto: UpdateAssetStorageDto, @Request() req: RequestWithUser) {
    const userId = req.user.userId;
    const data = await this.assetStorageService.update(parseInt(id), dto, userId);
    return {
      message: 'Almacenamiento actualizado exitosamente',
      data,
    };
  }
}
