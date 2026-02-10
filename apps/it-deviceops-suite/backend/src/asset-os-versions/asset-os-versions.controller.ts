import { Controller, Get, Post, Body, UseGuards, Query, Param, Put, Res, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetOsVersionsService } from './asset-os-versions.service';
import { CreateOsVersionDto, UpdateOsVersionDto } from './dto/asset-os-version.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('OS-versions')
@Controller('os-versions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetOsVersionsController {
  constructor(private readonly assetOsVersionsService: AssetOsVersionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar versiones de sistemas operativos' })
  @ApiResponse({ status: 200, description: 'Lista de versiones de SO' })
  @ApiQuery({ name: 'familyId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'typeId', required: false })
  async getOsVersions(
    @Query('familyId') familyId?: string,
    @Query('brandId') brandId?: string,
    @Query('typeId') typeId?: string,
  ) {
    const familyIdNum = familyId ? parseInt(familyId) : undefined;
    const brandIdNum = brandId ? parseInt(brandId) : undefined;
    const typeIdNum = typeId ? parseInt(typeId) : undefined;
    const data = await this.assetOsVersionsService.getOsVersions(familyIdNum, brandIdNum, typeIdNum);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva versión de SO' })
  @ApiResponse({ status: 201, description: 'Versión creada' })
  async createOsVersion(@Body() dto: CreateOsVersionDto, @Request() req: RequestWithUser) {
    const result = await this.assetOsVersionsService.createOsVersion(dto, req.user.userId);
    return {
      message: 'Versión de S.O. creada exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar versiones de SO a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetOsVersionsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=os-versions.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel para importar versiones' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetOsVersionsService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=os-versions-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar versiones de SO desde Excel' })
  @ApiResponse({ status: 200, description: 'Versiones importadas' })
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

    const result = await this.assetOsVersionsService.importFromExcel(file.buffer, req.user.userId);

    let message = '';
    if (result.insertados > 0 && result.duplicados.length > 0) {
      message = `${result.insertados} versiones insertadas. ${result.duplicados.length} duplicados detectados.`;
    } else if (result.insertados > 0) {
      message = `${result.insertados} versiones insertadas exitosamente`;
    } else if (result.duplicados.length > 0) {
      message = `${result.duplicados.length} duplicados detectados. No se insertaron nuevas versiones.`;
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
  @ApiOperation({ summary: 'Actualizar versiones de SO duplicadas después de confirmación' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.assetOsVersionsService.updateDuplicatesFromExcel(body.duplicates);

    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} versiones actualizadas`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener versión de SO por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la versión de SO' })
  async getOsVersionById(@Param('id') id: string) {
    const data = await this.assetOsVersionsService.getOsVersionById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar versión de SO' })
  @ApiResponse({ status: 200, description: 'Versión actualizada' })
  async updateOsVersion(
    @Param('id') id: string,
    @Body() dto: UpdateOsVersionDto,
    @Request() req: RequestWithUser
  ) {
    const result = await this.assetOsVersionsService.updateOsVersion(parseInt(id), dto, req.user.userId);
    return {
      message: 'Versión de S.O. actualizada exitosamente',
      data: result,
    };
  }
}
