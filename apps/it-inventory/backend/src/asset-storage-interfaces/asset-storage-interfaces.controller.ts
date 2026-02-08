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
import { AssetStorageInterfacesService } from './asset-storage-interfaces.service';
import { CreateStorageInterfaceDto, UpdateStorageInterfaceDto } from './dto/storage-interface.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('asset-storage-interfaces')
@ApiBearerAuth()
@Controller('asset-storage-interfaces')
@UseGuards(JwtAuthGuard)
export class AssetStorageInterfacesController {
  constructor(private readonly interfacesService: AssetStorageInterfacesService) {}

  @Get()
  async getAll() {
    const data = await this.interfacesService.getAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateStorageInterfaceDto, @Req() req: any) {
    const data = await this.interfacesService.create(dto, req.user.userId);
    return { success: true, data, message: 'Interfaz de almacenamiento creada exitosamente' };
  }

  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.interfacesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=interfaces-almacenamiento.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.interfacesService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=plantilla-interfaces-almacenamiento.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: any, @Req() req: any) {
    const result = await this.interfacesService.importFromExcel(file, req.user.userId);
    return {
      success: true,
      data: result,
      message: `Importación completada: ${result.insertados} insertados, ${result.duplicados.length} duplicados, ${result.errores.length} errores`,
    };
  }

  @Post('update-duplicates-excel')
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }, @Req() req: any) {
    const result = await this.interfacesService.updateDuplicatesFromExcel(body.duplicates, req.user.userId);
    return {
      success: true,
      data: result,
      message: `${result.actualizados} interfaces actualizadas`,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.interfacesService.getById(+id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStorageInterfaceDto, @Req() req: any) {
    const data = await this.interfacesService.update(+id, dto, req.user.userId);
    return { success: true, data, message: 'Interfaz de almacenamiento actualizada exitosamente' };
  }
}
