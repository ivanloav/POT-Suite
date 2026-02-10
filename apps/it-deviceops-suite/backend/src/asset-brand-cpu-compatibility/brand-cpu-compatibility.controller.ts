import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BrandCpuCompatibilityService } from './brand-cpu-compatibility.service';
import { CreateBrandCpuCompatibilityDto, DeleteBrandCpuCompatibilityDto } from './dto/brand-cpu-compatibility.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@ApiTags('Brand CPU Compatibility')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asset-brand-cpu-compatibility')
export class BrandCpuCompatibilityController {
  constructor(private readonly compatibilityService: BrandCpuCompatibilityService) {}

  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Obtener compatibilidades de CPU de una marca' })
  @ApiResponse({ status: 200, description: 'Lista de compatibilidades' })
  async getByBrand(@Param('brandId') brandId: string) {
    const data = await this.compatibilityService.getByBrand(+brandId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear compatibilidad de CPU para una marca' })
  @ApiResponse({ status: 201, description: 'Compatibilidad creada exitosamente' })
  async create(@Body() dto: CreateBrandCpuCompatibilityDto, @Request() req: any) {
    const userId = req.user.userId;
    const data = await this.compatibilityService.create(dto, userId);
    return { data };
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar compatibilidad de CPU de una marca' })
  @ApiResponse({ status: 200, description: 'Compatibilidad eliminada exitosamente' })
  async delete(@Body() dto: DeleteBrandCpuCompatibilityDto) {
    await this.compatibilityService.delete(dto);
    return { message: 'Compatibilidad eliminada exitosamente' };
  }
}
