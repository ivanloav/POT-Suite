import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BrandRamCompatibilityService } from './brand-ram-compatibility.service';
import { CreateBrandRamCompatibilityDto, DeleteBrandRamCompatibilityDto } from './dto/brand-ram-compatibility.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@ApiTags('Brand RAM Compatibility')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asset-brand-ram-compatibility')
export class BrandRamCompatibilityController {
  constructor(private readonly compatibilityService: BrandRamCompatibilityService) {}

  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Obtener compatibilidades de RAM de una marca' })
  @ApiResponse({ status: 200, description: 'Lista de compatibilidades' })
  async getByBrand(@Param('brandId') brandId: string) {
    const data = await this.compatibilityService.getByBrand(+brandId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear compatibilidad de RAM para una marca' })
  @ApiResponse({ status: 201, description: 'Compatibilidad creada exitosamente' })
  async create(@Body() dto: CreateBrandRamCompatibilityDto, @Request() req: any) {
    const userId = req.user.userId;
    const data = await this.compatibilityService.create(dto, userId);
    return { data };
  }

  @Delete()
  @ApiOperation({ summary: 'Eliminar compatibilidad de RAM de una marca' })
  @ApiResponse({ status: 200, description: 'Compatibilidad eliminada exitosamente' })
  async delete(@Body() dto: DeleteBrandRamCompatibilityDto) {
    await this.compatibilityService.delete(dto);
    return { message: 'Compatibilidad eliminada exitosamente' };
  }
}
