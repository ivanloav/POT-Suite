import { Controller, Get, Post, Body, UseGuards, Query, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetRamService } from './asset-ram.service';
import { CreateAssetRamDto, UpdateAssetRamDto } from './dto/asset-ram.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('asset-rams')
@Controller('asset-ram')
@ApiBearerAuth()
export class AssetRamController {
  constructor(private readonly assetRamService: AssetRamService) {}

  @Get()
  @ApiOperation({ summary: 'Listar modelos de RAM' })
  @ApiResponse({ status: 200, description: 'Lista de modelos de RAM' })
  async getAssetRAM() {
    const data = await this.assetRamService.getAssetRams();
    return { data };
  }

  @Get('memory-types')
  @ApiOperation({ summary: 'Listar tipos de memoria RAM' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de memoria' })
  async getMemoryTypes() {
    const data = await this.assetRamService.getRamMemoryTypes();
    return { data };
  }

  @Get('form-factors')
  @ApiOperation({ summary: 'Listar form factors de RAM' })
  @ApiResponse({ status: 200, description: 'Lista de form factors' })
  async getFormFactors() {
    const data = await this.assetRamService.getRamFormFactors();
    return { data };
  }
  
  @Get('export/excel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar RAM a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetRamService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-rams.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar plantilla de Excel para importar RAM' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetRamService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=asset-rams-template.xlsx',
    });
    res.send(buffer);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva opción de RAM' })
  @ApiResponse({ status: 201, description: 'RAM creada' })
  async createAssetRam(@Body() dto: CreateAssetRamDto, @Request() req: RequestWithUser) {
    const userId = req.user.userId;
    const data = { ...dto, createdBy: userId };
    const result = await this.assetRamService.createAssetRam(data);
    return {
      message: 'Opción de RAM creada exitosamente',
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener RAM por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la RAM' })
  async getAssetRamById(@Param('id') id: string) {
    const data = await this.assetRamService.getAssetRamById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar RAM' })
  @ApiResponse({ status: 200, description: 'RAM actualizada' })
  async updateAssetRam(@Param('id') id: string, @Body() dto: CreateAssetRamDto, @Request() req: RequestWithUser) {
    const userId = req.user.userId;
    const data = { ...dto, updatedBy: userId };
    const result = await this.assetRamService.updateAssetRam(parseInt(id), data);
    return {
      message: 'RAM actualizada exitosamente',
      data: result,
    };
  }

  @Post('import/excel')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar RAM desde Excel' })
  @ApiResponse({ status: 200, description: 'RAM importadas' })
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
    const result = await this.assetRamService.importFromExcel(file.buffer, userId);

    return {
      success: result.errores.length === 0 && result.duplicados.length === 0,
      message: result.duplicados.length > 0 
        ? `${result.insertados} opciones insertadas. ${result.duplicados.length} duplicados detectados.`
        : `Importación completada: ${result.insertados} opciones creadas`,
      data: result,
    };
  }

  @Post('update-duplicates-excel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar RAM duplicadas desde Excel' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.assetRamService.updateDuplicatesFromExcel(body.duplicates);
    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} opciones actualizadas`,
      data: result,
    };
  }
}
