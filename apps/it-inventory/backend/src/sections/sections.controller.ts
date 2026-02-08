import { Controller, Get, Post, Body, UseGuards, Param, Put, Res, UseInterceptors, UploadedFile, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Sections')
@Controller('sections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar secciones' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de secciones' })
  async getAll(@Query('siteId') siteId?: string) {
    const parsedSiteId = siteId ? parseInt(siteId) : undefined;
    const data = await this.sectionsService.getAll(parsedSiteId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva sección' })
  @ApiResponse({ status: 201, description: 'Sección creada' })
  async create(@Body() dto: CreateSectionDto, @Request() req: RequestWithUser) {
    const result = await this.sectionsService.create(dto, req.user.userId);
    return {
      message: 'Sección creada exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar secciones a Excel' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response, @Query('siteId') siteId?: string) {
    const parsedSiteId = siteId ? parseInt(siteId) : undefined;
    const buffer = await this.sectionsService.exportToExcel(parsedSiteId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=sections.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.sectionsService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=sections-template.xlsx',
    });
    res.send(buffer);
  }

  @Get('next-sort-order')
  @ApiOperation({ summary: 'Obtener el siguiente orden disponible para un sitio' })
  @ApiQuery({ name: 'siteId', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Siguiente orden disponible' })
  async getNextSortOrder(@Query('siteId') siteId: string) {
    const parsedSiteId = parseInt(siteId);
    const nextOrder = await this.sectionsService.getNextSortOrder(parsedSiteId);
    return { data: nextOrder };
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar secciones desde Excel' })
  @ApiResponse({ status: 200, description: 'Secciones importadas' })
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

    const result = await this.sectionsService.importFromExcel(file.buffer, req.user.userId);

    let message = '';
    if (result.insertados > 0 && result.duplicados.length > 0) {
      message = `${result.insertados} secciones insertadas. ${result.duplicados.length} duplicados detectados.`;
    } else if (result.insertados > 0) {
      message = `${result.insertados} secciones insertadas exitosamente`;
    } else if (result.duplicados.length > 0) {
      message = `${result.duplicados.length} duplicados detectados. No se insertaron nuevas secciones.`;
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
  @ApiOperation({ summary: 'Actualizar secciones duplicadas' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }) {
    const result = await this.sectionsService.updateDuplicatesFromExcel(body.duplicates);

    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} secciones actualizadas`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sección por ID' })
  @ApiResponse({ status: 200, description: 'Detalles de la sección' })
  async getById(@Param('id') id: string) {
    const data = await this.sectionsService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar sección' })
  @ApiResponse({ status: 200, description: 'Sección actualizada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
    @Request() req: RequestWithUser
  ) {
    const result = await this.sectionsService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Sección actualizada exitosamente',
      data: result,
    };
  }
}
