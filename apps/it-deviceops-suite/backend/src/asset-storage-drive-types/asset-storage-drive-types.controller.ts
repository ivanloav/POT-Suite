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
import { AssetStorageDriveTypesService } from './asset-storage-drive-types.service';
import { CreateStorageDriveTypeDto, UpdateStorageDriveTypeDto } from './dto/storage-drive-type.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('asset-storage-drive-types')
@ApiBearerAuth()
@Controller('asset-storage-drive-types')
@UseGuards(JwtAuthGuard)
export class AssetStorageDriveTypesController {
  constructor(private readonly driveTypesService: AssetStorageDriveTypesService) {}

  @Get()
  async getAll() {
    const data = await this.driveTypesService.getAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateStorageDriveTypeDto, @Req() req: any) {
    const data = await this.driveTypesService.create(dto, req.user.userId);
    return { success: true, data, message: 'Tipo de disco creado exitosamente' };
  }

  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.driveTypesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=tipos-disco.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.driveTypesService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=plantilla-tipos-disco.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: any, @Req() req: any) {
    const result = await this.driveTypesService.importFromExcel(file, req.user.userId);
    return {
      success: true,
      data: result,
      message: `Importación completada: ${result.insertados} insertados, ${result.duplicados.length} duplicados, ${result.errores.length} errores`,
    };
  }

  @Post('update-duplicates-excel')
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }, @Req() req: any) {
    const result = await this.driveTypesService.updateDuplicatesFromExcel(body.duplicates, req.user.userId);
    return {
      success: true,
      data: result,
      message: `${result.actualizados} tipos de disco actualizados`,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.driveTypesService.getById(+id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStorageDriveTypeDto, @Req() req: any) {
    const data = await this.driveTypesService.update(+id, dto, req.user.userId);
    return { success: true, data, message: 'Tipo de disco actualizado exitosamente' };
  }
}
