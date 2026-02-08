/**
 * Controlador de pedidos.
 * 
 * Gestiona la creación, consulta, actualización y eliminación de pedidos en el sistema.
 * Está protegido por JwtAuthGuard y SiteGuard para garantizar que sólo usuarios autorizados accedan a sus datos.
 * 
 * Endpoints:
 * - GET /orders → Lista pedidos (filtrables por sitio, estado, etc.).
 * - GET /orders/:id → Devuelve un pedido específico.
 * - POST /orders → Crea un nuevo pedido.
 * - PATCH /orders/:id → Actualiza un pedido.
 * - DELETE /orders/:id → Elimina un pedido.
 */
import { Controller, Get, Param, Post, Body, Patch, Delete, ParseIntPipe, UseGuards, Query, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { SiteGuard } from '../shared/guards/site.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { buildResponse, buildErrorResponse } from 'src/shared/utils/response-builder';
import { I18n, I18nContext } from 'nestjs-i18n';
import { OrdersService } from './orders.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { OrderCustomersDto } from './dto/order-customers.dto';
import { OrderCustomerTypesDto } from './dto/order-customer-types.dto';
import { OrderPriorityTypesDto } from './dto/order-priority-types.dto';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, SiteGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Limpia una cadena de texto eliminando acentos y convirtiéndola a mayúsculas
   */
  private clean(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  }

  @Get('sources')
  @ApiOperation({ summary: 'Obtener fuentes de pedidos por sitio' })
  @ApiOkResponse({ description: 'Lista de fuentes de pedidos' })
  async getOrderSources(
    @Query('siteId', ParseIntPipe) siteId: number, 
    @I18n() i18n: I18nContext,
    @Query('search') search?: string,
    @Query('q') q?: string
  ) {
    try {
      const searchTerm = (search ?? q)?.trim() || undefined;
      const data = await this.ordersService.searchOrderSourcesBySite(siteId, searchTerm);
      return buildResponse(data, await i18n.t('orders.sources_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_sources'), error);
    }
  }
  
  @Get('actions')
  @ApiOperation({ summary: 'Obtener acciones de pedidos por sitio' })
  @ApiOkResponse({ description: 'Lista de acciones de pedidos' })
  async getOrderActions(
    @Query('siteId') siteId: string, 
    @I18n() i18n: I18nContext,
    @Query('search') search?: string,
    @Query('q') q?: string
  ) {
    try {
      const searchTerm = (search ?? q)?.trim() || undefined;
      const data = await this.ordersService.searchOrderActionsBySite(parseInt(siteId), searchTerm);
      return buildResponse(data, await i18n.t('orders.actions_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_sources'), error);
    }
  }

  @Get('customers')
  @ApiOperation({ summary: 'Obtener clientes de pedidos por sitio' })
  @ApiOkResponse({ type: [OrderCustomersDto], description: 'Lista de clientes de pedidos' })
  async getOrderCustomers(
    @Query('siteId', ParseIntPipe) siteId: number,
    @I18n() i18n: I18nContext,
    @Query('search') search?: string,
    @Query('q') q?: string
  ) {
    try {
      const searchTerm = (search ?? q)?.trim() || undefined;
      const data = await this.ordersService.searchOrderCustomersBySite(siteId, searchTerm);
      return buildResponse(data, await i18n.t('orders.customers_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_sources'), error);
    }
  }

  @Get('customerTypes')
  @ApiOperation({ summary: 'Obtener tipos de clientes de pedidos por sitio' })
  @ApiOkResponse({ type: [OrderCustomerTypesDto], description: 'Lista de tipos de clientes de pedidos' })
  async getOrderCustomerTypes(
    @Query('siteId', ParseIntPipe) siteId: number, 
    @I18n() i18n: I18nContext,
    @Query('search') search?: string,
    @Query('q') q?: string
  ) {
    try {
      const searchTerm = (search ?? q )?.trim() || undefined;
      const data = await this.ordersService.searchCustomerTypesBySite(siteId, searchTerm);

      return buildResponse(data, await i18n.t('orders.customerTypes_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_sources'), error);
    }
  }

  @Get('products')
  @ApiOperation({ summary: 'Obtener productos para líneas de pedido por sitio' })
  async getProducts(
    @Query('siteId', ParseIntPipe) siteId: number, 
    @I18n() i18n: I18nContext,
    @Query('search') search?: string,
    @Query('q') q?: string
  ) {
    try {
      const searchTerm = (search ?? q )?.trim() || undefined;
      const data = await this.ordersService.searchProductsBySite(siteId, searchTerm);

      return buildResponse(data, await i18n.t('orders.products_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_sources'), error);
    }
  }

  @Get('priorityTypes')
  @ApiOperation({ summary: 'Obtener tipos de prioridad de acciones por sitio' })
  @ApiOkResponse({ type: [OrderPriorityTypesDto], description: 'Lista de tipos de prioridad de acciones' })
  async getOrderPriorityTypes(
    @Query('siteId', ParseIntPipe) siteId: number, 
    @I18n() i18n: I18nContext,
    @Query('search') search?: string,
    @Query('q') q?: string
  ) {
    try {
      const searchTerm = (search ?? q )?.trim() || undefined;
      const data = await this.ordersService.searchPriorityTypesBySite(siteId, searchTerm);

      return buildResponse(data, await i18n.t('orders.priorityTypes_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_sources'), error);
    }
  }

  @Get('paymentTypes')
  @ApiOperation({ summary: 'Obtener tipos de pago de pedidos por sitio' })
  @ApiOkResponse({ type: [OrderPriorityTypesDto], description: 'Lista de tipos de pago de pedidos' })
  async getOrderPaymentTypes(
    @Query('siteId', ParseIntPipe) siteId: number, 
    @I18n() i18n: I18nContext,
    @Query('search') search?: string,
    @Query('q') q?: string
  ) {
    try {
      const searchTerm = (search ?? q )?.trim() || undefined;
      const data = await this.ordersService.searchPaymentTypesBySite(siteId, searchTerm);

      return buildResponse(data, await i18n.t('orders.paymentTypes_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_sources'), error);
    }
  }
  
  @Get()
  @ApiOperation({ summary: 'Obtener todos los pedidos', description: 'Devuelve una lista de todos los pedidos.' })
  @ApiOkResponse({ description: 'Lista de pedidos', type: [OrderResponseDto] })
  async findAll(@Query() query: FindOrdersQueryDto, @Req() req: any, @I18n() i18n: I18nContext) {
    try {
      const siteId = query.siteId;
      const userId = req.user.userId;
      const { data, total } = await this.ordersService.findAll({ ...query, siteId, userId });
      return buildResponse(data, await i18n.t('orders.list_success'), total);
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_list'), error);
    }
  }

  @Get('last-reference')
  @ApiOperation({ summary: 'Obtener la última referencia de pedido por sitio', description: 'Devuelve la última referencia de pedido para el siteId indicado.' })
  @ApiOkResponse({ description: 'Última referencia de pedido', type: OrderResponseDto })
  async getLastOrderReference(
    @Query('siteId', ParseIntPipe) siteId: number,
    @I18n() i18n: I18nContext
  ) {
    try {
      const data = await this.ordersService.getLastOrderReference(siteId);
      return buildResponse(data, await i18n.t('orders.last_reference_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_last_reference'), error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID', description: 'Devuelve un pedido específico por su ID.' })
  @ApiOkResponse({ description: 'Pedido encontrado', type: OrderResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number, @I18n() i18n: I18nContext) {
    try {
      const data = await this.ordersService.findOne(id);
      return buildResponse(data, await i18n.t('orders.detail_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_detail'), error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear pedido y mover documento escaneado', description: 'Crea un pedido y mueve el documento escaneado desde la carpeta origen.' })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto, // Usa CreateOrderDto si puedes parsear los campos
    @I18n() i18n: I18nContext
  ) {
    const fs = require('fs');
    const path = require('path');
    try {
      // 1. Definir rutas
      // Buscar el nombre del usuario por userId
      const userData = await this.usersService.findUserById(createOrderDto.createdBy);

      if (!userData || !userData.userName) {
        throw new BadRequestException('No se encontró el usuario para el userId proporcionado.');
      }

      // El orderReference se genera automáticamente en el servicio
      // Crear el pedido primero para obtener el orderReference generado
      const createdOrder = await this.ordersService.create(createOrderDto);

      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');

      const userFolder = this.clean(userData.userName);
      const siteFolder = this.clean(createOrderDto.siteName);
      const SOURCE_PATH = `${process.env.SCAN_DOCUMENT_PATH}/Users/${userFolder}`;
      const DESTINATION_PATH = `${process.env.SCAN_DOCUMENT_PATH}/Sites/${siteFolder}/${createOrderDto.section}/${yyyy}-${mm}-${dd}`;

      // 2. Buscar archivo más reciente en SOURCE_PATH
      const files = fs.readdirSync(SOURCE_PATH)
        .filter(f => fs.statSync(path.join(SOURCE_PATH, f)).isFile())
        .sort((a, b) => {
          return fs.statSync(path.join(SOURCE_PATH, b)).mtimeMs - fs.statSync(path.join(SOURCE_PATH, a)).mtimeMs;
        });
      if (files.length === 0) {
        throw new BadRequestException('No se encontró ningún documento escaneado en la carpeta origen.');
      }
      const latestFile = files[0];
      const ext = path.extname(latestFile);
      // 3. Renombrar archivo usando el orderReference del pedido creado
      const orderReference = createdOrder.orderReference || 'pedido';
      const min = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const fecha = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
      const newFileName = `${orderReference}-${fecha}${ext}`;
      // 4. Mover y renombrar
      if (!fs.existsSync(DESTINATION_PATH)) {
        fs.mkdirSync(DESTINATION_PATH, { recursive: true });
      }
      const oldPath = path.join(SOURCE_PATH, latestFile);
      const newPath = path.join(DESTINATION_PATH, newFileName);
      fs.renameSync(oldPath, newPath);

      return buildResponse(createdOrder, await i18n.t('orders.create_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_create'), error);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un pedido por ID', description: 'Actualiza un pedido específico por su ID.' })
  @ApiOkResponse({ description: 'Pedido actualizado', type: OrderResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto, @I18n() i18n: I18nContext) {
    try {
      const data = await this.ordersService.update(id, dto);
      return buildResponse(data, await i18n.t('orders.update_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_update'), error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un pedido por ID', description: 'Elimina un pedido específico por su ID.' })
  @ApiOkResponse({ description: 'Pedido eliminado' })
  async remove(@Param('id', ParseIntPipe) id: number, @I18n() i18n: I18nContext) {
    try {
      await this.ordersService.remove(id);
      return buildResponse(null, await i18n.t('orders.delete_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('orders.error_delete'), error);
    }
  }
}