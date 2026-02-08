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
import { AssetRamMemoryTypesService } from './asset-ram-memory-types.service';
import { CreateRamMemoryTypeDto, UpdateRamMemoryTypeDto } from './dto/ram-memory-type.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('asset-ram-memory-types')
@ApiBearerAuth()
@Controller('asset-ram-memory-types')
@UseGuards(JwtAuthGuard)
export class AssetRamMemoryTypesController {
  constructor(private readonly memoryTypesService: AssetRamMemoryTypesService) {}

  @Get()
  async getAll() {
    const data = await this.memoryTypesService.getAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateRamMemoryTypeDto, @Req() req: any) {
    const data = await this.memoryTypesService.create(dto, req.user.userId);
    return { success: true, data, message: 'Tipo de memoria RAM creado exitosamente' };
  }

  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.memoryTypesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=tipos-memoria-ram.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.memoryTypesService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=plantilla-tipos-memoria-ram.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: any, @Req() req: any) {
    const result = await this.memoryTypesService.importFromExcel(file, req.user.userId);
    return {
      success: true,
      data: result,
      message: `Importación completada: ${result.insertados} insertados, ${result.duplicados.length} duplicados, ${result.errores.length} errores`,
    };
  }

  @Post('update-duplicates-excel')
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }, @Req() req: any) {
    const result = await this.memoryTypesService.updateDuplicatesFromExcel(body.duplicates, req.user.userId);
    return {
      success: true,
      data: result,
      message: `${result.actualizados} tipos de memoria actualizados`,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.memoryTypesService.getById(+id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRamMemoryTypeDto, @Req() req: any) {
    const data = await this.memoryTypesService.update(+id, dto, req.user.userId);
    return { success: true, data, message: 'Tipo de memoria RAM actualizado exitosamente' };
  }
}
