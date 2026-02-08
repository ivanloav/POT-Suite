# 🔧 Modificaciones necesarias en el Backend (NestJS)

## 1. Instalar dependencias para manejo de archivos

```bash
npm install multer
npm install -D @types/multer
```

## 2. Modificar el controlador de órdenes

```typescript
// backend/src/orders/orders.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import * as multer from 'multer';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('scannedDocument', {
    storage: multer.memoryStorage(), // Guardar en memoria temporalmente
    fileFilter: (req, file, callback) => {
      // Solo permitir PDFs e imágenes
      if (file.mimetype.match(/\/(pdf|jpeg|jpg|png)$/)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('Solo se permiten archivos PDF, JPG o PNG'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB máximo
    },
  }))
  async createOrder(
    @Body() body: any,
    @UploadedFile() scannedDocument?: Express.Multer.File,
  ) {
    // Si viene como FormData, el orderData viene como string
    let createOrderDto: CreateOrderDto;
    
    if (typeof body.orderData === 'string') {
      try {
        createOrderDto = JSON.parse(body.orderData);
      } catch (error) {
        throw new BadRequestException('Datos de pedido inválidos');
      }
    } else {
      createOrderDto = body;
    }

    return this.ordersService.create(createOrderDto, scannedDocument);
  }
}
```

## 3. Modificar el servicio de órdenes

```typescript
// backend/src/orders/orders.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, scannedDocument?: Express.Multer.File) {
    // 1. Crear el pedido primero para obtener la referencia
    const order = new Order();
    Object.assign(order, createOrderDto);
    
    // Generar la referencia del pedido (ejemplo: ORD-2025-001)
    const lastOrder = await this.ordersRepository.findOne({
      order: { createdAt: 'DESC' }
    });
    
    const nextNumber = lastOrder ? 
      parseInt(lastOrder.orderReference.split('-').pop() || '0') + 1 : 1;
    
    const currentYear = new Date().getFullYear();
    order.orderReference = `ORD-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;

    // 2. Guardar el pedido para obtener el ID
    const savedOrder = await this.ordersRepository.save(order);

    // 3. Si hay documento escaneado, procesarlo
    if (scannedDocument) {
      try {
        // Crear directorio si no existe
        const uploadsDir = path.join(process.cwd(), 'uploads', 'orders');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Obtener extensión del archivo original
        const originalExtension = path.extname(scannedDocument.originalname);
        
        // Crear nombre final con la referencia real del pedido
        const finalFileName = `${savedOrder.orderReference}_${Date.now()}${originalExtension}`;
        const finalFilePath = path.join(uploadsDir, finalFileName);

        // Guardar el archivo con el nombre correcto
        await fs.writeFile(finalFilePath, scannedDocument.buffer);

        // Actualizar el pedido con la ruta del archivo
        savedOrder.scannedDocumentPath = `uploads/orders/${finalFileName}`;
        savedOrder.scannedDocumentOriginalName = scannedDocument.originalname;
        
        await this.ordersRepository.save(savedOrder);

        console.log(`Documento guardado: ${scannedDocument.originalname} → ${finalFileName}`);
      } catch (error) {
        console.error('Error guardando documento:', error);
        // No fallar el pedido si hay error con el documento
      }
    }

    return savedOrder;
  }
}
```

## 4. Actualizar la entidad Order

```typescript
// backend/src/orders/entities/order.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  orderId: number;

  @Column({ unique: true })
  orderReference: string;

  // ... otras columnas existentes ...

  @Column({ nullable: true })
  scannedDocumentPath?: string;

  @Column({ nullable: true })
  scannedDocumentOriginalName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## 5. Configuración adicional

```typescript
// backend/src/app.module.ts
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    // ... otros imports
    MulterModule.register({
      dest: './uploads', // Directorio temporal
    }),
  ],
  // ...
})
export class AppModule {}
```

## 6. Servir archivos estáticos (opcional)

```typescript
// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(5000);
}
bootstrap();
```

## 7. Ejemplo de respuesta

Con estos cambios, cuando se cree un pedido con documento:

```json
{
  "orderId": 123,
  "orderReference": "ORD-2025-001",
  "scannedDocumentPath": "uploads/orders/ORD-2025-001_1704473280000.pdf",
  "scannedDocumentOriginalName": "documento_escaneado.pdf",
  // ... otros campos del pedido
}
```

El archivo se guarda como: `ORD-2025-001_1704473280000.pdf` en lugar del nombre temporal.

## 8. Migración de base de datos

```sql
-- Agregar las nuevas columnas a la tabla orders
ALTER TABLE orders ADD COLUMN scanned_document_path VARCHAR(500) NULL;
ALTER TABLE orders ADD COLUMN scanned_document_original_name VARCHAR(255) NULL;
```

## Flujo completo:

1. **Frontend**: Usuario escanea documento → se guarda en directorio configurado
2. **Frontend**: Usuario hace clic en "Guardar pedido" → busca automáticamente el archivo más reciente
3. **Frontend**: Envía pedido con archivo temporal
4. **Backend**: Crea pedido → genera referencia → renombra archivo → guarda ruta en DB
5. **Resultado**: Archivo guardado con nombre `ORD-2025-001_timestamp.pdf`