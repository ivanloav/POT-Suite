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
import { AssetStorageFormFactorsService } from './asset-storage-form-factors.service';
import { CreateStorageFormFactorDto, UpdateStorageFormFactorDto } from './dto/storage-form-factor.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('asset-storage-form-factors')
@ApiBearerAuth()
@Controller('asset-storage-form-factors')
@UseGuards(JwtAuthGuard)
export class AssetStorageFormFactorsController {
  constructor(private readonly formFactorsService: AssetStorageFormFactorsService) {}

  @Get()
  async getAll() {
    const data = await this.formFactorsService.getAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateStorageFormFactorDto, @Req() req: any) {
    const data = await this.formFactorsService.create(dto, req.user.userId);
    return { success: true, data, message: 'Form factor de almacenamiento creado exitosamente' };
  }

  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.formFactorsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=form-factors-almacenamiento.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.formFactorsService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=plantilla-form-factors-almacenamiento.xlsx',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: any, @Req() req: any) {
    const result = await this.formFactorsService.importFromExcel(file, req.user.userId);
    return {
      success: true,
      data: result,
      message: `Importación completada: ${result.insertados} insertados, ${result.duplicados.length} duplicados, ${result.errores.length} errores`,
    };
  }

  @Post('update-duplicates-excel')
  async updateDuplicatesFromExcel(@Body() body: { duplicates: any[] }, @Req() req: any) {
    const result = await this.formFactorsService.updateDuplicatesFromExcel(body.duplicates, req.user.userId);
    return {
      success: true,
      data: result,
      message: `${result.actualizados} form factors actualizados`,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const data = await this.formFactorsService.getById(+id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateStorageFormFactorDto, @Req() req: any) {
    const data = await this.formFactorsService.update(+id, dto, req.user.userId);
    return { success: true, data, message: 'Form factor de almacenamiento actualizado exitosamente' };
  }
}
