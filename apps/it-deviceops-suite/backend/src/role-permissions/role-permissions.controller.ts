import { Controller, Get, Post, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto, DeleteRolePermissionDto } from './dto/role-permission.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@ApiTags('Role Permissions')
@Controller('role-permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolePermissionsController {
  constructor(private readonly rolePermissionsService: RolePermissionsService) {}

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Obtener permisos de un rol' })
  @ApiResponse({ status: 200, description: 'Lista de permisos del rol' })
  async getByRole(@Param('roleId') roleId: string) {
    const data = await this.rolePermissionsService.getByRole(parseInt(roleId));
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Asignar permiso a rol' })
  @ApiResponse({ status: 201, description: 'Permiso asignado exitosamente' })
  async create(@Body() createDto: CreateRolePermissionDto) {
    const data = await this.rolePermissionsService.create(createDto);
    return { success: true, message: 'Permiso asignado exitosamente', data };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar permiso de rol' })
  @ApiResponse({ status: 200, description: 'Permiso eliminado exitosamente' })
  async delete(@Body() deleteDto: DeleteRolePermissionDto) {
    await this.rolePermissionsService.delete(deleteDto);
    return { success: true, message: 'Permiso eliminado exitosamente' };
  }
}
