import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TypeOsCompatibilityService } from './type-os-compatibility.service';
import { CreateTypeOsCompatibilityDto, DeleteTypeOsCompatibilityDto } from './dto/type-os-compatibility.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@ApiTags('Type OS Compatibility')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asset-type-os-compatibility')
export class TypeOsCompatibilityController {
  constructor(private readonly compatibilityService: TypeOsCompatibilityService) {}

  @Get('type/:typeId')
  @ApiOperation({ summary: 'Obtener compatibilidades de SO de un tipo de activo' })
  @ApiResponse({ status: 200, description: 'Lista de compatibilidades' })
  async getByType(@Param('typeId') typeId: string) {
    const data = await this.compatibilityService.getByType(+typeId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear compatibilidad de SO para un tipo de activo' })
  @ApiResponse({ status: 201, description: 'Compatibilidad creada exitosamente' })
  async create(@Body() dto: CreateTypeOsCompatibilityDto, @Request() req: any) {
    const userId = req.user.userId;
    const data = await this.compatibilityService.create(dto, userId);
    return { data };
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar compatibilidad de SO de un tipo de activo' })
  @ApiResponse({ status: 200, description: 'Compatibilidad eliminada exitosamente' })
  async delete(@Body() dto: DeleteTypeOsCompatibilityDto) {
    await this.compatibilityService.delete(dto);
    return { message: 'Compatibilidad eliminada exitosamente' };
  }
}
