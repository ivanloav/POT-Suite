/**
 * Controlador de sitios.
 * 
 * Permite la gestión de los distintos sitios o clientes asociados al sistema.
 * Un usuario puede tener acceso a uno o varios sitios, y este controlador permite consultarlos o gestionarlos.
 * 
 * Endpoints:
 * - GET /sites → Devuelve todos los sitios (administrador).
 * - GET /sites/my → Devuelve los sitios asignados al usuario actual.
 * - GET /sites/current → Devuelve el sitio seleccionado actualmente.
 * - GET /sites/:id → Devuelve información de un sitio por ID.
 * - POST /sites → Crea un nuevo sitio.
 * - PATCH /sites/:id → Actualiza un sitio existente.
 * - DELETE /sites/:id → Elimina un sitio.
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SiteGuard } from 'src/shared/guards/site.guard';
import { SiteId } from 'src/shared/decorators/site-id.decorator';
import { UserId } from 'src/shared/decorators/user-id.decorator';
import { buildResponse, buildErrorResponse } from 'src/shared/utils/response-builder';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('Sites')
@UseGuards(JwtAuthGuard, SiteGuard)
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo sitio', description: 'Crea un nuevo sitio con la información proporcionada.' })
  @ApiOkResponse({ description: 'Sitio creado exitosamente', type: CreateSiteDto })
  async create(@Body() createSiteDto: CreateSiteDto, @I18n() i18n: I18nContext) {
    try {
      const data = await this.sitesService.create(createSiteDto);
      return buildResponse(data, await i18n.t('sites.create_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('sites.error_create'), error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los sitios', description: 'Devuelve una lista de todos los sitios.' })
  @ApiOkResponse({ description: 'Lista de sitios', type: [CreateSiteDto] })
  async findAll(@I18n() i18n: I18nContext) {
    try {
      const data = await this.sitesService.findAll();
      return buildResponse(data, await i18n.t('sites.list_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('sites.error_list'), error);
    }
  }
  
  @Get('my')
  @ApiOperation({ summary: 'Obtener sitios del usuario actual', description: 'Devuelve los sitios asociados al usuario autenticado.' })
  @ApiOkResponse({ description: 'Lista de sitios del usuario', type: [CreateSiteDto] })
  async findMy(@UserId() userId: number, @I18n() i18n: I18nContext) {
    try {
      const data = await this.sitesService.findForUser(userId);
      return buildResponse(data, await i18n.t('sites.assigned_sites'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('sites.error_list'), error);
    }
  }

  @Get('current')
  @ApiOperation({ summary: 'Obtener el sitio actual', description: 'Devuelve la información del sitio actual según la sesión o configuración.' })
  @ApiOkResponse({ description: 'Sitio actual', type: CreateSiteDto })
  async getCurrent(@SiteId() siteId: number, @I18n() i18n: I18nContext) {
    try {
      const data = await this.sitesService.findOne(siteId);
      return buildResponse(data, await i18n.t('sites.selected_site'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('sites.error_list'), error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un sitio por ID', description: 'Devuelve un sitio específico por su ID.' })
  @ApiOkResponse({ description: 'Sitio encontrado', type: CreateSiteDto })
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    try {
      const data = await this.sitesService.findOne(+id);
      return buildResponse(data, await i18n.t('sites.list_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('sites.error_list'), error);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un sitio por ID', description: 'Actualiza un sitio específico por su ID.' })
  @ApiOkResponse({ description: 'Sitio actualizado', type: CreateSiteDto })
  async update(@Param('id') id: string, @Body() updateSiteDto: UpdateSiteDto, @I18n() i18n: I18nContext) {
    try {
      const data = await this.sitesService.update(+id, updateSiteDto);
      return buildResponse(data, await i18n.t('sites.update_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('sites.error_update'), error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un sitio por ID', description: 'Elimina un sitio específico por su ID.' })
  @ApiOkResponse({ description: 'Sitio eliminado' })
  async remove(@Param('id') id: string, @I18n() i18n: I18nContext) {
    try {
      await this.sitesService.remove(+id);
      return buildResponse(null, await i18n.t('sites.delete_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('sites.error_delete'), error);
    }
  }
}