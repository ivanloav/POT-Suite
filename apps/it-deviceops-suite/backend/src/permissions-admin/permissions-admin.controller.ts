import { Controller, Get, Post, Put, Param, Body, UseGuards, Res, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { PermissionsAdminService } from './permissions-admin.service';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Permissions Admin')
@Controller('permissions-admin')
export class PermissionsAdminController {
  constructor(private readonly permissionsAdminService: PermissionsAdminService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los permisos' })
  @ApiResponse({ status: 200, description: 'Lista de permisos' })
  async getPermissions() {
    const data = await this.permissionsAdminService.findAll();
    return { data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  @ApiResponse({ status: 201, description: 'Permiso creado exitosamente' })
  async create(@Body() createPermissionDto: CreatePermissionDto, @Req() req: any) {
    const data = await this.permissionsAdminService.create(createPermissionDto, req.user.userId);
    return { success: true, message: 'Permiso creado exitosamente', data };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar permisos a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.permissionsAdminService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="permissions_${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar plantilla Excel para importar permisos' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.permissionsAdminService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_permissions.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar permisos desde Excel' })
  @ApiResponse({ status: 200, description: 'Importación completada' })
  async importFromExcel(@UploadedFile() file: any) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporcionó ningún archivo',
      };
    }

    const result = await this.permissionsAdminService.importFromExcel(file.buffer);
    return {
      success: true,
      message: `Importación completada. Insertados: ${result.insertados}, Duplicados: ${result.duplicados}`,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del permiso' })
  async getPermissionById(@Param('id') id: string) {
    const data = await this.permissionsAdminService.findOne(parseInt(id));
    return { data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un permiso' })
  @ApiResponse({ status: 200, description: 'Permiso actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Req() req: any,
  ) {
    const data = await this.permissionsAdminService.update(parseInt(id), updatePermissionDto, req.user.userId);
    return { success: true, message: 'Permiso actualizado exitosamente', data };
  }
}
