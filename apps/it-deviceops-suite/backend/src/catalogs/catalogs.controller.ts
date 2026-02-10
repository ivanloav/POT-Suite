import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogAssetBrandDto } from './dto/catalog.dto';
import { CreateAssetModelDto } from '../asset-models/dto/asset-model.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';

@ApiTags('Catalogs')
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('asset-types')
  @ApiOperation({ summary: 'Listar tipos de activos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de activos' })
  async getAssetTypes() {
    const data = await this.catalogsService.getAssetTypes();
    return { data };
  }

  @Get('asset-statuses')
  @ApiOperation({ summary: 'Listar estados de activos' })
  @ApiResponse({ status: 200, description: 'Lista de estados de activos' })
  async getAssetStatuses() {
    const data = await this.catalogsService.getAssetStatuses();
    return { data };
  }

  @Get('sections')
  @ApiOperation({ summary: 'Listar secciones' })
  @ApiQuery({ name: 'siteId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de secciones' })
  async getSections(@Query('siteId') siteId?: string) {
    const data = await this.catalogsService.getSections(siteId ? parseInt(siteId) : undefined);
    return { data };
  }

  @Get('asset-brands')
  @ApiOperation({ summary: 'Listar marcas de activos' })
  @ApiResponse({ status: 200, description: 'Lista de marcas' })
  async getAssetBrands() {
    const data = await this.catalogsService.getAssetBrands();
    return { data };
  }

  @Post('asset-brands')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nueva marca' })
  @ApiResponse({ status: 201, description: 'Marca creada' })
  async createAssetBrand(@Body() dto: CreateCatalogAssetBrandDto) {
    const result = await this.catalogsService.createAssetBrand(dto);
    return {
      message: 'Marca creada exitosamente',
      data: result,
    };
  }

  @Get('asset-models')
  @ApiOperation({ summary: 'Listar modelos de activos' })
  @ApiQuery({ name: 'typeId', required: false, type: Number, description: 'Filtrar por tipo de activo' })
  @ApiResponse({ status: 200, description: 'Lista de modelos' })
  async getAssetModels(@Query('typeId') typeId?: number) {
    const data = await this.catalogsService.getAssetModels(typeId ? Number(typeId) : undefined);
    return { data };
  }

  @Post('asset-models')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear nuevo modelo' })
  @ApiResponse({ status: 201, description: 'Modelo creado' })
  async createAssetModel(@Body() dto: CreateAssetModelDto) {
    const result = await this.catalogsService.createAssetModel(dto);
    return {
      message: 'Modelo creado exitosamente',
      data: result,
    };
  }

  @Get('os-families')
  @ApiOperation({ summary: 'Listar familias de sistemas operativos' })
  @ApiResponse({ status: 200, description: 'Lista de familias de SO' })
  async getOsFamilies() {
    const data = await this.catalogsService.getOsFamilies();
    return { data };
  }

  @Get('cpus')
  @ApiOperation({ summary: 'Listar CPUs' })
  @ApiQuery({ name: 'brandId', required: false, type: Number, description: 'Filtrar por marca de activo' })
  @ApiResponse({ status: 200, description: 'Lista de CPUs' })
  async getCpus(@Query('brandId') brandId?: number) {
    const data = await this.catalogsService.getCpus(brandId ? Number(brandId) : undefined);
    return { data };
  }

  @Get('ram-options')
  @ApiOperation({ summary: 'Listar opciones de RAM' })
  @ApiQuery({ name: 'brandId', required: false, type: Number, description: 'Filtrar por marca de activo' })
  @ApiResponse({ status: 200, description: 'Lista de opciones de RAM' })
  async getRamOptions(@Query('brandId') brandId?: number) {
    const data = await this.catalogsService.getRamOptions(brandId ? Number(brandId) : undefined);
    return { data };
  }

  @Get('storage-options')
  @ApiOperation({ summary: 'Listar opciones de almacenamiento' })
  @ApiResponse({ status: 200, description: 'Lista de opciones de almacenamiento' })
  async getStorageOptions() {
    const data = await this.catalogsService.getStorageOptions();
    return { data };
  }
}
