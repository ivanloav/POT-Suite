import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as cookieParser from "cookie-parser"

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // 🛡️ Configurar CORS con FRONTEND_URL desde .env
  // Acepta una lista separada por comas y compara por HOSTNAME (ignora el puerto)
  const allowedOriginsRaw = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const allowedHosts = allowedOriginsRaw.map((o) => {
    try {
      return new URL(o).hostname;
    } catch {
      // fallback si el valor no es una URL completa
      return o.replace(/^https?:\/\//, '').split('/')[0];
    }
  });

  app.use(cookieParser());

  app.enableCors({
    origin: (origin, cb) => {
      // permitir llamadas del mismo origen (SSR/health checks) donde origin puede ser undefined
      if (!origin) return cb(null, true);
      try {
        const host = new URL(origin).hostname;
        if (allowedHosts.includes(host)) {
          return cb(null, true);
        }
      } catch {
        // si no es una URL válida, bloquea
      }
      return cb(new Error(`Origin not allowed: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, x-site-id',
    exposedHeaders: 'x-site-id',
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('GesPack API')
    .setDescription('API de conexión a la DB de GesPack')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,           // ← importante cuando algo no aparece
    // include: [OrdersModule],     // opcional: fuerza incluir solo módulos listados
  });
  SwaggerModule.setup('api/docs', app, document);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // <-- ¡esto es clave!
  const port = process.env.PORT || 5000;

  await app.listen(port, '0.0.0.0');
  //console.log(`App is running on: http://localhost:${port}`);
  console.log(`App is running on: ${process.env.DB_HOST}:${port}`);
  console.log('CORS Origin:', allowedHosts);
}

bootstrap();