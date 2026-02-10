import { Controller, Get, Post, Put, Param, Body, UseGuards, Res, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { RolesAdminService } from './roles-admin.service';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Roles Admin')
@Controller('roles-admin')
export class RolesAdminController {
  constructor(private readonly rolesAdminService: RolesAdminService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  async getRoles() {
    const data = await this.rolesAdminService.findAll();
    return { data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  async create(@Body() createRoleDto: CreateRoleDto, @Req() req: any) {
    const data = await this.rolesAdminService.create(createRoleDto, req.user.userId);
    return { success: true, message: 'Rol creado exitosamente', data };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar roles a Excel' })
  @ApiResponse({ status: 200, description: 'Archivo Excel generado' })
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.rolesAdminService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="roles_${Date.now()}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('template/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Descargar plantilla Excel para importar roles' })
  @ApiResponse({ status: 200, description: 'Plantilla Excel generada' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.rolesAdminService.generateTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_roles.xlsx"',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('import/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importar roles desde Excel' })
  @ApiResponse({ status: 200, description: 'Importación completada' })
  async importFromExcel(@UploadedFile() file: any) {
    if (!file) {
      return {
        success: false,
        message: 'No se proporcionó ningún archivo',
      };
    }

    const result = await this.rolesAdminService.importFromExcel(file.buffer);
    return {
      success: true,
      message: `Importación completada. Insertados: ${result.insertados}, Duplicados: ${result.duplicados}`,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiResponse({ status: 200, description: 'Detalles del rol' })
  async getRoleById(@Param('id') id: string) {
    const data = await this.rolesAdminService.findOne(parseInt(id));
    return { data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any,
  ) {
    const data = await this.rolesAdminService.update(parseInt(id), updateRoleDto, req.user.userId);
    return { success: true, message: 'Rol actualizado exitosamente', data };
  }
}
