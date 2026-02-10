import { Controller, Get, Post, Put, Param, Body, Request, UseGuards, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CreateSiteDto, UpdateSiteDto } from './dto/site.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Sites')
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los sites' })
  @ApiResponse({ status: 200, description: 'Lista de sites activos' })
  async getSites() {
    const data = await this.sitesService.findAll();
    return { data };
  }

  @Get('my-sites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener sedes autorizadas del usuario actual' })
  @ApiResponse({ status: 200, description: 'Lista de sedes del usuario' })
  async getMySites(@Request() req: any) {
    const userId = req.user.userId;
    const data = await this.sitesService.findUserSites(userId);
    return { data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo site' })
  @ApiResponse({ status: 201, description: 'Site creado exitosamente' })
  async create(@Body() createSiteDto: CreateSiteDto, @Request() req: any) {
    const userId = req.user.userId;
    const data = await this.sitesService.create(createSiteDto, userId);
    return { success: true, message: 'Site creado exitosamente', data };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar sites a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.sitesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sites_${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar plantilla Excel para importar sites' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.sitesService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_sites.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar sites desde Excel' })
  @ApiResponse({ status: 200, description: 'Importación completada' })
  async importFromExcel(@UploadedFile() file: any, @Request() req: any) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporcionó ningún archivo',
      };
    }

    const userId = req.user.userId;
    const result = await this.sitesService.importFromExcel(file.buffer, userId);
    return {
      success: true,
      message: `Importación completada. Insertados: ${result.insertados}, Duplicados: ${result.duplicados}`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un site por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del site' })
  async getSiteById(@Param('id') id: string) {
    const data = await this.sitesService.findOne(parseInt(id));
    return { data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un site' })
  @ApiResponse({ status: 200, description: 'Site actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
    @Request() req: any
  ) {
    const userId = req.user.userId;
    const data = await this.sitesService.update(parseInt(id), updateSiteDto, userId);
    return { success: true, message: 'Site actualizado exitosamente', data };
  }
}
