import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BrandOsCompatibilityService } from './brand-os-compatibility.service';
import { CreateBrandOsCompatibilityDto, DeleteBrandOsCompatibilityDto } from './dto/brand-os-compatibility.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@ApiTags('Brand OS Compatibility')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asset-brand-os-compatibility')
export class BrandOsCompatibilityController {
  constructor(private readonly compatibilityService: BrandOsCompatibilityService) {}

  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Obtener compatibilidades de SO de una marca' })
  @ApiResponse({ status: 200, description: 'Lista de compatibilidades' })
  async getByBrand(@Param('brandId') brandId: string) {
    const data = await this.compatibilityService.getByBrand(+brandId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear compatibilidad de SO para una marca' })
  @ApiResponse({ status: 201, description: 'Compatibilidad creada exitosamente' })
  async create(@Body() dto: CreateBrandOsCompatibilityDto, @Request() req: any) {
    const userId = req.user.userId;
    const data = await this.compatibilityService.create(dto, userId);
    return { data };
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar compatibilidad de SO de una marca' })
  @ApiResponse({ status: 200, description: 'Compatibilidad eliminada exitosamente' })
  async delete(@Body() dto: DeleteBrandOsCompatibilityDto) {
    await this.compatibilityService.delete(dto);
    return { message: 'Compatibilidad eliminada exitosamente' };
  }
}
