import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Put,
  Res,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AssetCpuVendorsService } from './asset-cpu-vendors.service';
import { CreateCpuVendorDto, UpdateCpuVendorDto } from './dto/cpu-vendor.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@ApiTags('Asset CPU Vendors')
@Controller('asset-cpu-vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetCpuVendorsController {
  constructor(private readonly assetCpuVendorsService: AssetCpuVendorsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar vendedores de CPU' })
  @ApiResponse({ status: 200, description: 'Lista de vendedores' })
  async getAll() {
    const data = await this.assetCpuVendorsService.getAll();
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo vendedor de CPU' })
  @ApiResponse({ status: 201, description: 'Vendedor creado' })
  async create(@Body() dto: CreateCpuVendorDto, @Request() req: RequestWithUser) {
    const result = await this.assetCpuVendorsService.create(dto, req.user.userId);
    return {
      message: 'Vendedor de CPU creado exitosamente',
      data: result,
    };
  }

  @Get('export/excel')
  @ApiOperation({ summary: 'Exportar vendedores a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetCpuVendorsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=cpu-vendors.xlsx',
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @ApiOperation({ summary: 'Descargar plantilla de Excel' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetCpuVendorsService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=cpu-vendors-template.xlsx',
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @ApiOperation({ summary: 'Importar vendedores desde Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Resultado de la importación' })
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(
    @UploadedFile() file: any,
    @Request() req: RequestWithUser,
  ) {
    const result = await this.assetCpuVendorsService.importFromExcel(file.buffer, req.user.userId);
    return result;
  }

  @Post('update-duplicates-excel')
  @ApiOperation({ summary: 'Actualizar duplicados desde Excel' })
  @ApiResponse({ status: 200, description: 'Duplicados actualizados' })
  async updateDuplicatesFromExcel(
    @Body('duplicates') duplicates: any[],
    @Request() req: RequestWithUser,
  ) {
    const result = await this.assetCpuVendorsService.updateDuplicatesFromExcel(
      duplicates,
      req.user.userId,
    );
    return result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vendedor por ID' })
  @ApiResponse({ status: 200, description: 'Vendedor encontrado' })
  async getById(@Param('id') id: string) {
    const data = await this.assetCpuVendorsService.getById(parseInt(id));
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar vendedor' })
  @ApiResponse({ status: 200, description: 'Vendedor actualizado' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCpuVendorDto,
    @Request() req: RequestWithUser,
  ) {
    const data = await this.assetCpuVendorsService.update(parseInt(id), dto, req.user.userId);
    return {
      message: 'Vendedor de CPU actualizado exitosamente',
      data,
    };
  }
}
