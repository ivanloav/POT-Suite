import { Controller, Get, Post, Body, UseGuards, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetOsFamiliesService } from './asset-os-families.service';
import { CreateOsFamilyDto, UpdateOsFamilyDto } from './dto/asset-os-family.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('OS-families')
@Controller('os-families')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetOsFamiliesController {
  constructor(private readonly assetOsFamiliesService: AssetOsFamiliesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar familias de sistemas operativos' })
  @ApiResponse({ status: 200, description: 'Lista de familias de SO' })
  async getOsFamilies() {
    const data = await this.assetOsFamiliesService.getOsFamilies();
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva familia de SO' })
  @ApiResponse({ status: 201, description: 'Familia creada' })
  async createOsFamily(@Body() dto: CreateOsFamilyDto, @Request() req: RequestWithUser) {
    const result = await this.assetOsFamiliesService.createOsFamily(dto, req.user.userId);
    return {
      message: 'Familia de S.O. creada exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar familias de SO a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportFamiliesToExcel(@Res() res: Response) {
    const buffer = await this.assetOsFamiliesService.exportOsFamiliesToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=os-families.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel para importar familias' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadFamiliesTemplate(@Res() res: Response) {
    const buffer = await this.assetOsFamiliesService.generateOsFamiliesTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=os-families-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar familias de SO desde Excel' })
  @ApiResponse({ status: 200, description: 'Familias importadas' })
  async importFamiliesFromExcel(
    @UploadedFile() file: any,
    @Request() req: RequestWithUser,
  ) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporcionó ningún archivo',
      };
    }

    const result = await this.assetOsFamiliesService.importOsFamiliesFromExcel(file.buffer, req.user.userId);

    let message = '';
    if (result.insertados > 0 && result.duplicados.length > 0) {
      message = `${result.insertados} familias insertadas. ${result.duplicados.length} duplicados detectados.`;
    } else if (result.insertados > 0) {
      message = `${result.insertados} familias insertadas exitosamente`;
    } else if (result.duplicados.length > 0) {
      message = `${result.duplicados.length} duplicados detectados. No se insertaron nuevas familias.`;
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
  @ApiOperation({ summary: 'Actualizar familias de SO duplicadas después de confirmación' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateFamiliesDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.assetOsFamiliesService.updateOsFamiliesDuplicatesFromExcel(body.duplicates);

    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} familias actualizadas`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener familia de SO por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la familia de SO' })
  async getOsFamilyById(@Param('id') id: string) {
    const data = await this.assetOsFamiliesService.getOsFamilyById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar familia de SO' })
  @ApiResponse({ status: 200, description: 'Familia actualizada' })
  async updateOsFamily(
    @Param('id') id: string,
    @Body() dto: UpdateOsFamilyDto,
    @Request() req: RequestWithUser
  ) {
    const result = await this.assetOsFamiliesService.updateOsFamily(parseInt(id), dto, req.user.userId);
    return {
      message: 'Familia de S.O. actualizada exitosamente',
      data: result,
    };
  }
}
