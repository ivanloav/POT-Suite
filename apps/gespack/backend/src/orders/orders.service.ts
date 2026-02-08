import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../entities/orders.entity';
import { OrderItem } from '../entities/order-items.entity';
import { OrderPayments } from '../entities/order-payments.entity';
import { OrderAddress } from '../entities/order-addresses.entity';
import { OrderNotes } from '../entities/order-notes.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import { plainToInstance } from 'class-transformer';
import { UserSite } from 'src/entities/user-site.entity';
import { OrderSource } from '../entities/order-sources.entity';
import { Action } from '../entities/action.entity';
import { OrderActionWithCostDto } from './dto/order-action-with-cost.dto';
import { Customer } from '../entities/customers.entity';
import { CustomerType } from '../entities/customer-types.entity';
import { Product } from 'src/entities/product.entity';
import { OrderCustomersDto } from './dto/order-customers.dto';
import { OrderCustomerTypesDto } from './dto/order-customer-types.dto';
import { OrderProductsListDto } from './dto/order-products-list.dto';
import { ActionPriorityType } from 'src/entities/action-priority-types.entity';
import { OrderPriorityTypesDto } from './dto/order-priority-types.dto';
import { OrderPaymentTypes } from 'src/entities/order-payment-types.entity';
import { OrderPaymentTypesDto } from './dto/order-payment-types.dto';

export type SortableKey = 
  | 'orderId' 
  | 'siteId' 
  | 'orderReference' 
  | 'brandId' 
  | 'firstName' 
  | 'lastName' 
  | 'status' 
  | 'createdAt';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) 
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(OrderPayments)
    private readonly orderPayments: Repository<OrderPayments>,
    @InjectRepository(OrderAddress)
    private readonly orderAddresses: Repository<OrderAddress>,
    @InjectRepository(OrderNotes)
    private readonly orderNotes: Repository<OrderNotes>,
    @InjectRepository(UserSite)
    private readonly userSites: Repository<UserSite>,
    @InjectRepository(OrderSource) // 👈 AÑADIR
    private readonly orderSources: Repository<OrderSource>,
    @InjectRepository(Action)
    private readonly orderActions: Repository<Action>,
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(CustomerType)
    private readonly customerTypes: Repository<CustomerType>,
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(ActionPriorityType)
    private readonly actionPriorityTypes: Repository<ActionPriorityType>,
    @InjectRepository(OrderPaymentTypes)
    private readonly orderPaymentTypes: Repository<OrderPaymentTypes>,
  ) {}

  async findAll(params: FindOrdersQueryDto & { siteId: number; userId: number }) {
    const {
      page,
      limit,
      sortBy,
      sortDir,
      qId,
      qSiteId,
      qSiteName,
      qOrderReference,
      qBrandId,
      qBrandName,
      qFullName,
      qPaymentTypeName,
      qOrderAmount,
      qStatus,
      qCreated,
      siteId,
      userId,
      qPaidAt,
    } = params;

    let allowedSiteIds: number[] | null = null;

    if (!siteId || siteId === 0) {
        const rows = await this.userSites.find({ where: { userId } });
        allowedSiteIds = rows.map(r => r.siteId);
    }

    const base = this.orders.createQueryBuilder('o')
      .leftJoinAndSelect('o.site', 's')
      .leftJoinAndSelect('o.payment', 'op')
      .leftJoinAndSelect('op.paymentType', 'pt') // Join con order_payment_types
      .leftJoinAndSelect('o.brand', 'b'); // Suponiendo que tienes la relación definida

      if (siteId && siteId > 0) {
        base.where('o.siteId = :siteId', { siteId })
      } else if (allowedSiteIds && allowedSiteIds.length > 0) {
        base.where('o.siteId IN (:...siteIds)', { siteIds: allowedSiteIds })
      } else {
        base.where('1=0') // Si no hay sites permitidos, no devuelve nada
      }
      
      base.take(limit)
      base.skip((page - 1) * limit);

          // Filtros
    if (qId) base.andWhere('o.orderId = :id', { id: +qId });
    if (qSiteName) {base.andWhere('s.siteName ILIKE :siteName', { siteName: `%${qSiteName}%` });}
    if (qOrderReference) base.andWhere('o.orderReference ILIKE :ref', { ref: `%${qOrderReference}%` });
    if (qBrandName) { base.andWhere('b.brandName ILIKE :brandName', { brandName: `%${qBrandName}%` });}
    if (qFullName) {base.andWhere(`(o.firstName || ' ' || o.lastName) ILIKE :fullName`, { fullName: `%${qFullName}%` });}
    if (qPaymentTypeName) {base.andWhere('pt.paymentType ILIKE :paymentTypeName', { paymentTypeName: `%${qPaymentTypeName}%` });}
    if (qOrderAmount) base.andWhere('o.orderAmount = :oa', { oa: +qOrderAmount });
    if (qStatus) base.andWhere('o.status = :status', { status: qStatus });
    if (qPaidAt) base.andWhere('o.paidAt = :paidAt', { paidAt: qPaidAt });

    if (qCreated) {
      const [from, to] = qCreated.split('..');
      if (from && to) {
        base.andWhere('o.createdAt BETWEEN :from AND :to', { from, to });
      } else if (from) {
        base.andWhere('o.createdAt >= :from', { from });
      } else if (to) {
        base.andWhere('o.createdAt <= :to', { to });
      }
    }

    // Ordenación
    const sortField = 
      sortBy === 'brandName' ? 'b.brandName' : 
      sortBy === 'siteName' ? 's.siteName' :
  sortBy === 'paymentTypeName' ? 'pt.paymentType' :
  `o.${sortBy ?? 'orderId'}`;
const sortOrder = sortDir ?? 'DESC';
base.orderBy(sortField, sortOrder as 'ASC' | 'DESC');

    const [data, total] = await base.getManyAndCount();

    // Mapea cada pedido para añadir brandName
    const mappedData = data.map(o => ({
      orderId: o.orderId,
      siteId: o.siteId,
      siteName: o.site?.siteName,
      orderReference: o.orderReference,
      brandId: o.brandId,
      brandName: o.brand?.brandName, // <-- aquí obtienes el nombre
      firstName: o.firstName,
      lastName: o.lastName,
      paymentTypeId: o.paymentTypeId,
      paymentTypeName: o.payment?.paymentType?.paymentType,
      orderAmount: o.orderAmount,
      status: o.status,
      createdAt: o.createdAt,
    isPaid: o.isPaid,
    paidAt: o.paidAt,
    isInvoiced: o.isInvoiced,
    invoicedAt: o.invoicedAt
    }));
    return {
      data: Array.isArray(mappedData) ? mappedData : [],
      total: typeof total === 'number' ? total : 0,
    };
  }

  findOne(id: number) { return this.orders.findOneBy({ orderId: id }); }
  
  async create(dto: CreateOrderDto, maxRetries = 3): Promise<Order> {
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxRetries) {
      try {
        return await this.createOrderAttempt(dto);
      } catch (error) {
        lastError = error;
        
        // Verificar si es un error de clave duplicada (PostgreSQL error code 23505)
        const isDuplicateKeyError = 
          error.code === '23505' || 
          error.message?.includes('duplicate key') ||
          error.message?.includes('unique constraint');

        // Si es error de clave duplicada y aún hay reintentos, continuar
        if (isDuplicateKeyError && attempt < maxRetries - 1) {
          attempt++;
          // Pequeño delay antes de reintentar (10-50ms aleatorio)
          await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40));
          continue;
        }

        // Si no es error de clave duplicada o se agotaron los reintentos, lanzar error
        throw error;
      }
    }

    // Si llegamos aquí, se agotaron los reintentos
    throw lastError;
  }

  private async createOrderAttempt(dto: CreateOrderDto): Promise<Order> {
    const { orderItems, payment, addresses, notes, siteName, section, ...orderData } = dto;

    // Preparar datos del pedido
    const orderReference = await this.prepareOrderReference(orderData);
    this.setDefaultOrderData(orderData, orderItems);

    // Crear pago temporal
    const paymentResult = await this.createTemporaryPayment(orderData, payment, dto.createdBy);

    // Crear pedido principal
    const orderResult = await this.createMainOrder(orderData, orderReference, paymentResult.orderPaymentsId);

    // Actualizar pago con orderId real
    await this.updatePaymentWithOrderId(paymentResult, orderResult.orderId);

    // Guardar datos relacionados
    await this.saveOrderItems(orderResult, orderItems);
    await this.saveOrderAddresses(orderResult, addresses, dto.createdBy);
    await this.saveOrderNotes(orderResult, notes, dto.createdBy);

    return orderResult;
  }

  /**
   * Prepara la referencia del pedido, generándola si no existe
   */
  private async prepareOrderReference(orderData: any): Promise<string> {
    if (orderData.orderReference) {
      return orderData.orderReference;
    }
    
    const lastReference = await this.getLastOrderReference(orderData.siteId);
    return this.generateNextReference(lastReference);
  }

  /**
   * Establece valores por defecto en los datos del pedido
   */
  private setDefaultOrderData(orderData: any, orderItems?: any[]): void {
    if (!orderData.orderDatetime) {
      orderData.orderDatetime = new Date();
    }
    if (!orderData.createdAt) {
      orderData.createdAt = new Date();
    }
    orderData.orderLines = orderItems?.length || 0;
  }

  /**
   * Crea el registro de pago temporal (con orderId = 0)
   */
  private async createTemporaryPayment(orderData: any, payment: any, createdBy?: number): Promise<any> {
    const tempOrderPayment = this.orderPayments.create({
      siteId: orderData.siteId,
      orderId: 0,
      paymentTypeId: payment.paymentTypeId,
      isDeferred: payment.isDeferred || false,
      scheduleCount: payment.scheduleCount || 1,
      holderName: payment.holderName,
      amount: payment.amount,
      bankName: payment.bankName,
      chequeNumber: payment.chequeNumber,
      cardTypeId: payment.cardTypeId,
      cardNumber: payment.cardNumber,
      expirationDate: payment.expirationDate,
      securityCode: payment.securityCode,
      createdBy: String(createdBy || 'system'),
      createdAt: new Date(),
    });

    const savedPayment = await this.orderPayments.save(tempOrderPayment);
    return Array.isArray(savedPayment) ? savedPayment[0] : savedPayment;
  }

  /**
   * Crea el pedido principal
   */
  private async createMainOrder(orderData: any, orderReference: string, paymentTypeId: number): Promise<Order> {
    // Normalizar clientType si es necesario
    if (orderData.clientType !== undefined && typeof orderData.clientType === 'string') {
      const parsed = Number(orderData.clientType);
      (orderData as any).clientType = Number.isFinite(parsed) ? parsed : orderData.clientType;
    }

    const orderPayload: any = {
      ...orderData,
      orderReference,
      paymentTypeId,
    };

    const order = this.orders.create(orderPayload);
    const savedOrder = await this.orders.save(order);
    
    return Array.isArray(savedOrder) ? savedOrder[0] : savedOrder;
  }

  /**
   * Actualiza el pago con el orderId real
   */
  private async updatePaymentWithOrderId(payment: any, orderId: number): Promise<void> {
    payment.orderId = orderId;
    await this.orderPayments.save(payment);
  }

  /**
   * Guarda las líneas de pedido si existen
   */
  private async saveOrderItems(order: Order, orderItems?: any[]): Promise<void> {
    if (!orderItems || orderItems.length === 0) {
      return;
    }

    const items = orderItems.map((item, index) => {
      return this.orderItems.create({
        siteId: order.siteId,
        orderId: order.orderId,
        lineNumber: item.lineNumber || index + 1,
        productId: item.productId,
        productRef: item.productRef,
        catalogRef: item.catalogRef,
        catalogCode: item.catalogCode,
        quantity: item.qty,
        productDescription: item.productDescription,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        isStockReserved: item.isStockReserved || false,
        isSubstitute: item.isSubstitute || false,
        isUnavailable: item.isUnavailable || false,
        isSupplierShipped: item.isSupplierShipped || false,
      });
    });

    await this.orderItems.save(items);
  }

  /**
   * Guarda las direcciones del pedido si existen
   */
  private async saveOrderAddresses(order: Order, addresses?: any, createdBy?: number): Promise<void> {
    if (!addresses) {
      return;
    }

    const orderAddress = this.orderAddresses.create({
      orderId: order.orderId,
      siteId: order.siteId,
      orderReference: order.orderReference,
      billingCustomerName: addresses.billingCustomerName,
      billingAddressLine1: addresses.billingAddressLine1,
      billingAddressLine2: addresses.billingAddressLine2,
      billingAddressLine3: addresses.billingAddressLine3,
      billingAddressLine4: addresses.billingAddressLine4,
      billingAddressLine5: addresses.billingAddressLine5,
      billingPostalCode: addresses.billingPostalCode,
      billingCity: addresses.billingCity,
      billingMobilePhone: addresses.billingMobilePhone,
      shippingCustomerName: addresses.shippingCustomerName,
      shippingAddressLine1: addresses.shippingAddressLine1,
      shippingAddressLine2: addresses.shippingAddressLine2,
      shippingAddressLine3: addresses.shippingAddressLine3,
      shippingAddressLine4: addresses.shippingAddressLine4,
      shippingAddressLine5: addresses.shippingAddressLine5,
      shippingPostalCode: addresses.shippingPostalCode,
      shippingCity: addresses.shippingCity,
      shippingMobilePhone: addresses.shippingMobilePhone,
      createdBy: String(createdBy || 'system'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.orderAddresses.save(orderAddress);
  }

  /**
   * Guarda las notas del pedido si existen
   */
  private async saveOrderNotes(order: Order, notes?: any[], createdBy?: number): Promise<void> {
    if (!notes || notes.length === 0) {
      return;
    }

    const orderNotes = notes
      .filter(note => note.noteText && note.noteText.trim())
      .map(note => this.orderNotes.create({
        siteId: order.siteId,
        orderId: order.orderId,
        orderReference: order.orderReference,
        noteText: note.noteText.trim(),
        isInternal: note.isInternal || false,
        createdBy: String(createdBy || 'system'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

    if (orderNotes.length > 0) {
      await this.orderNotes.save(orderNotes);
    }
  }
  
  update(id: number, dto: UpdateOrderDto) { return this.orders.save({ orderId: id, ...(dto as any) }); }
  async remove(id: number) { await this.orders.delete({ orderId: id }); return true; }
  async getOrderSourcesBySite(siteId: number) {
    return this.orderSources.find({
      where: { siteId, isActive: true },
      select: ['orderSourceId', 'sourceName'],
      order: { sourceName: 'ASC' }
    });
  }
  async getOrderActionsBySite(siteId: number) {
    return this.orderActions.find({
      where: { siteId, isActive: true },
      select: ['actionId', 'actionName'],
      order: { actionName: 'ASC' }
    });
  }

  async getLastOrderReference(siteId: number): Promise<string | null> {
    const lastOrder = await this.orders.createQueryBuilder('o')
      .where('o.siteId = :siteId', { siteId })
      .orderBy('o.orderId', 'DESC')
      .getOne();

    return lastOrder ? lastOrder.orderReference : null;
  }

  /**
   * Genera la siguiente referencia de pedido basándose en la última
   * Si no hay referencia previa, retorna '00000001'
   * Si hay referencia, incrementa el número en 1
   */
  private generateNextReference(lastReference: string | null): string {
    if (!lastReference) {
      return '00000001';
    }
    
    // Parsear el número de la última referencia
    const lastNumber = parseInt(lastReference, 10);
    
    // Si no es un número válido, empezar desde 1
    if (isNaN(lastNumber)) {
      return '00000001';
    }
    
    // Incrementar y formatear con padding de 8 dígitos
    const nextNumber = lastNumber + 1;
    return String(nextNumber).padStart(8, '0');
  }

  async searchOrderActionsBySite(siteId: number, search?: string): Promise<OrderActionWithCostDto[]> {
    const qb = this.orderActions.createQueryBuilder('a')
      .leftJoin('a.actionCategory', 'ac', 'ac.actionCategoryId = a.actionCategoryId AND ac.siteId = a.siteId')
      .leftJoin('ac.actionCategoryCosts', 'acc', 'acc.actionCategoryId = ac.actionCategoryId AND acc.siteId = a.siteId')
      .where('a.siteId = :siteId', { siteId })
      .andWhere('a.isActive = :isActive', { isActive: true });

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(`(
        CAST(a.actionId AS TEXT) ILIKE :term OR
        a.actionName ILIKE :term
      )`, { term });
    }

    const rows = await qb
      .addSelect('acc.mandatory_fee', 'mandatoryFee')
      .orderBy('a.actionId', 'ASC')
      .limit(50)
      .getRawAndEntities();

    return rows.entities.map((row, index) => plainToInstance(OrderActionWithCostDto, {
      actionId: row.actionId,
      actionName: row.actionName,
      mandatoryFee: rows.raw[index]?.mandatoryFee ?? null,
    }));
  }

  async searchOrderCustomersBySite(siteId: number, search?: string): Promise<OrderCustomersDto[]> {
    const qb = this.customers.createQueryBuilder('c')
      .leftJoin('customer_marked', 'cm', 'cm.customer_id = c.customer_id AND cm.site_id = c.site_id AND cm.is_active = true')
      .leftJoinAndSelect('customer_marked_types', 'cmt', 'cmt.marked_type_id = cm.marked_type_id AND cmt.site_id = cm.site_id')
      .where('c.siteId = :siteId', { siteId })
      .andWhere('c.isActive = true');

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(`(
        CAST(c.customerCode AS TEXT) ILIKE :term OR
        c.customerFirstName ILIKE :term OR
        c.customerLastName ILIKE :term OR
        CONCAT(c.customerFirstName, ' ', c.customerLastName) ILIKE :term OR
        CONCAT(c.customerLastName, ' ', c.customerFirstName) ILIKE :term OR
        cmt.name ILIKE :term
      )`, { term });
    }

    const rows = await qb
      .addSelect('cmt.name', 'markedName')
      .addSelect('c.privileged', 'isPrivilege')
      .addSelect('c.shippingGender', 'shippingGender')
      .orderBy('c.customerCode', 'ASC')
      .limit(50)
      .getRawAndEntities();

    return rows.entities.map((row, index) => plainToInstance(OrderCustomersDto, {
      ...row,
      markedName: rows.raw[index]?.markedName ?? null,
      privileged: rows.raw[index]?.isPrivilege ?? null,
      shippingGender: rows.raw[index]?.shippingGender ?? null,
    }, { excludeExtraneousValues: true }));
  }

  async searchCustomerTypesBySite(siteId: number, search?: string): Promise<OrderCustomerTypesDto[]> {
    const qb = this.customerTypes.createQueryBuilder('ct')
      .where('ct.siteId = :siteId', { siteId })
      .andWhere('ct.isActive = true');

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(`(
        CAST(ct.typeCode AS TEXT) ILIKE :term OR
        ct.typeName ILIKE :term
      )`, { term });
    }

    const rows = await qb
      .orderBy('ct.typeCode', 'ASC')
      .limit(50)
      .getMany();

    // Filtra a EXACTAMENTE los campos expuestos en tu DTO (@Expose)
    return plainToInstance(OrderCustomerTypesDto, rows, {
      excludeExtraneousValues: true,
    });
  }

  async searchPriorityTypesBySite(siteId: number, search?: string): Promise<OrderPriorityTypesDto[]> {
    const qb = this.actionPriorityTypes.createQueryBuilder('apt')
      .leftJoinAndSelect('apt.actionCategoryCosts', 'acc', 'acc.siteId = apt.siteId AND acc.actionPriorityId = apt.actionPriorityId')
      .where('apt.siteId = :siteId', { siteId })
      .andWhere('apt.isActive = true');

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(`(
        CAST(apt.actionPriorityId AS TEXT) ILIKE :term OR
        apt.priorityName ILIKE :term
      )`, { term });
    }

    const rows = await qb
      .addSelect('acc.shippingCost', 'shippingCost')
      .orderBy('apt.actionPriorityId', 'ASC')
      .limit(50)
      .getRawAndEntities();
    
    // Filtra a EXACTAMENTE los campos expuestos en tu DTO (@Expose)
    return rows.entities.map((row, index) => plainToInstance(OrderPriorityTypesDto, {
      ...row,
      shippingCost: rows.raw[index]?.shippingCost ?? null,
    }, { excludeExtraneousValues: true }));
  }

  async searchPaymentTypesBySite(siteId: number, search?: string): Promise<OrderPaymentTypesDto[]> {
    const qb = this.orderPaymentTypes.createQueryBuilder('opt')
      .leftJoinAndSelect('opt.fields', 'field')
      .where('opt.siteId = :siteId', { siteId })
      .andWhere('opt.isActive = true');

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(`(
        CAST(opt.orderPaymentTypeId AS TEXT) ILIKE :term OR
        opt.paymentType ILIKE :term OR
        opt.description ILIKE :term
      )`, { term });
    }

    const rows = await qb
      .orderBy('opt.orderPaymentTypeId', 'ASC')
      .addOrderBy('field.fieldOrder', 'ASC')
      .limit(50)
      .getMany();

    // Filtra a EXACTAMENTE los campos expuestos en tu DTO (@Expose)
    return plainToInstance(OrderPaymentTypesDto, rows, {
      excludeExtraneousValues: true,
    });
  }

  async searchProductsBySite(siteId: number, search?: string): Promise<OrderProductsListDto[]> {
    const qb = this.products.createQueryBuilder('p')
      .select(['p.productId', 'p.productRef', 'p.description', 'p.price', 'p.weight', 'p.vatType'])
      .where('p.siteId = :siteId', { siteId })
      .andWhere('p.isActive = true');

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(`(
        CAST(p.productId AS TEXT) ILIKE :term OR
        p.productRef ILIKE :term OR
        p.description ILIKE :term
      )`, { term });
    }

    qb.addSelect(subQuery => {
      return subQuery
        .select('CAST(v.vat_value AS double precision)')
        .from('vat_yearly', 'v')
        .where('v.site_id = p.siteId')
        .andWhere('v.vat_type = p.vat_type')
        .orderBy('v.vat_id', 'DESC')
        .limit(1);
    }, 'vatValue');

    const rows = await qb
      .orderBy('p.productRef', 'ASC')
      .limit(50)
      .getRawAndEntities();

    // Mapear a tu DTO (por ejemplo OrderProductsListDto) e inyectar vatValue
    return rows.entities.map((entity, i) => {
      const dto = plainToInstance(OrderProductsListDto, entity, { excludeExtraneousValues: true });
      // vatValue viene como string/number en rows.raw[i].vatValue
      (dto as any).vatValue = rows.raw[i]?.vatValue ?? null;
      return dto;
    });
  }

  async searchOrderSourcesBySite(siteId: number, search?: string) {
    const qb = this.orderSources.createQueryBuilder('source')
      .where('source.siteId = :siteId', { siteId })
      .andWhere('source.isActive = :isActive', { isActive: true });

    if (search?.trim()) {
      qb.andWhere('LOWER(source.sourceName) LIKE LOWER(:search)', { 
        search: `%${search.trim()}%` 
      });
    }

    return qb
      .select(['source.orderSourceId', 'source.sourceName'])
      .orderBy('source.orderSourceId', 'ASC')
      .getMany();
  }

}