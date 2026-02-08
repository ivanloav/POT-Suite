// src/orders/dto/update-order.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

/**
 * Campos que NO se deben modificar vía body:
 * - siteId: vendrá del contexto (tenant) o header (x-site-id).
 * - createdAt / modifiedAt: manejados por la DB/app.
 * - orderId: va en la ruta (:orderId), no en el body.
 *
 * Si también quieres “blindar” orderReference para que no cambie,
 * añádelo al OmitType: ['siteId','createdAt','modifiedAt','orderReference']
 */
export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['siteId', 'orderReference', 'createdAt', 'modifiedAt'] as const),
) {}