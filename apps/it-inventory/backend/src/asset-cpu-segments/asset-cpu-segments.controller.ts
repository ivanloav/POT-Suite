import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { AssetCpuSegmentsService } from './asset-cpu-segments.service';
import { CreateCpuSegmentDto, UpdateCpuSegmentDto } from './dto/cpu-segment.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('asset-cpu-segments')
@ApiBearerAuth()
@Controller('asset-cpu-segments')
@UseGuards(JwtAuthGuard)
export class AssetCpuSegmentsController {
  constructor(private readonly segmentsService: AssetCpuSegmentsService) {}

  @Get()
  async getAll() {
    const data = await this.segmentsService.getAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateCpuSegmentDto, @Req() req: any) {
    const data = await this.segmentsService.create(dto, req.user.userId);
    return { success: true, data, message: 'Segmento de CPU creado exitosamente' };
  }

  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.segmentsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=segmentos-cpu.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.segmentsService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=plantilla-segmentos-cpu.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: any, @Req() req: any) {
    const result = await this.segmentsService.importFromExcel(file, req.user.userId);
    return {
      success: true,
      data: result,
      message: `Importación completada: ${result.insertados} insertados, ${result.duplicados.length} duplicados, ${result.errores.length} errores`,
    };
  }

  @Post('update-duplicates-excel')
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }, @Req() req: any) {
    const result = await this.segmentsService.updateDuplicatesFromExcel(body.duplicates, req.user.userId);
    return {
      success: true,
      data: result,
      message: `${result.actualizados} segmentos actualizados`,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.segmentsService.getById(+id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCpuSegmentDto, @Req() req: any) {
    const data = await this.segmentsService.update(+id, dto, req.user.userId);
    return { success: true, data, message: 'Segmento de CPU actualizado exitosamente' };
  }
}
