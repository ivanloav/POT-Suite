import { Body, Controller, Get, Param, Post, Put, Query, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { HolidaysService } from './holidays.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';

@ApiTags('Holidays')
@Controller('holidays')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  @ApiOperation({ summary: 'Listar festivos' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de festivos' })
  async getAll(@Query('isActive') isActive?: string) {
    const data = await this.holidaysService.getAll({
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo festivo' })
  @ApiResponse({ status: 201, description: 'Festivo creado' })
  async create(@Body() dto: CreateHolidayDto, @Request() req: RequestWithUser) {
    const result = await this.holidaysService.create(dto, req.user.userId);
    return {
      message: 'Festivo creado exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar festivos a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.holidaysService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=holidays.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.holidaysService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=holidays-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar festivos desde Excel' })
  @ApiResponse({ status: 200, description: 'Festivos importados' })
  async importFromExcel(@UploadedFile() file: any, @Request() req: RequestWithUser) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporciono ningun archivo',
      };
    }

    const result = await this.holidaysService.importFromExcel(file.buffer, req.user.userId);

    let message = '';
    if (result.insertados > 0 && result.duplicados.length > 0) {
      message = `${result.insertados} festivos insertados. ${result.duplicados.length} duplicados detectados.`;
    } else if (result.insertados > 0) {
      message = `${result.insertados} festivos insertados exitosamente`;
    } else if (result.duplicados.length > 0) {
      message = `${result.duplicados.length} duplicados detectados. No se insertaron nuevos festivos.`;
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
  @ApiOperation({ summary: 'Actualizar festivos duplicados' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }, @Request() req: RequestWithUser) {
    const result = await this.holidaysService.updateDuplicatesFromExcel(body.duplicates, req.user.userId);

    return {
      success: result.errores.length === 0,
      message: `${result.actualizados} festivos actualizados`,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener festivo por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del festivo' })
  async getById(@Param('id') id: string) {
    const data = await this.holidaysService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar festivo' })
  @ApiResponse({ status: 200, description: 'Festivo actualizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHolidayDto,
    @Request() req: RequestWithUser,
  ) {
    const result = await this.holidaysService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Festivo actualizado exitosamente',
      data: result,
    };
  }
}
