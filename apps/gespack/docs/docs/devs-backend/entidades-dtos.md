---
sidebar_position: 3
slug: /devs-backend/entidades-dtos
---

# Entidades y DTOs principales

Las entidades representan las tablas de la base de datos y los DTOs definen la estructura de los datos que viajan por la API.

## Ejemplo de entidad: Order
```typescript
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  orderId: number;

  @Column()
  siteId: number;

  @Column()
  orderReference: string;

  @Column('numeric')
  orderAmount: number;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'date', nullable: true })
  paidAt: Date | null;
  // ...otros campos
}
```

## Ejemplo de DTO: OrderResponseDto
```typescript
export class OrderResponseDto {
  orderId: number;
  siteId: number;
  orderReference: string;
  orderAmount: number;
  status: string;
  paidAt?: string;
  // ...otros campos
}
```

## Relación entre entidad y DTO
- La entidad define la estructura en la base de datos.
- El DTO define qué datos se exponen por la API.
- Los servicios transforman entidades en DTOs antes de responder.

---

Siguiente: [Servicios y controladores](./servicios-controladores)
