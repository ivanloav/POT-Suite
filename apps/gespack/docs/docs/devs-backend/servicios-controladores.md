---
sidebar_position: 4
slug: /devs-backend/servicios-controladores
---

# Servicios y controladores

Los servicios implementan la lógica de negocio y los controladores gestionan las rutas y peticiones HTTP.

## Ejemplo de servicio
```typescript
@Injectable()
export class OrdersService {
  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Validación y lógica
    const order = this.ordersRepository.create(dto);
    await this.ordersRepository.save(order);
    return toOrderResponseDto(order);
  }
}
```

## Ejemplo de controlador
```typescript
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }
}
```

## Flujo de una petición
1. El frontend envía una petición HTTP.
2. El controlador la recibe y llama al servicio correspondiente.
3. El servicio procesa la lógica y responde con un DTO.

---

Siguiente: [Autenticación y permisos](./auth-permisos)
