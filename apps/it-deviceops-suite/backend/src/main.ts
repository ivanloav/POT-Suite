import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter?.getInstance?.();
  if (instance && typeof instance.set === 'function') {
    instance.set('trust proxy', 1);
  }

  // CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('IT Inventory API')
      .setDescription('API REST para gestión de inventario de TI con sistema de asignaciones y control de activos')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Endpoints de autenticación y gestión de usuarios')
      .addTag('Assets', 'Gestión de activos de TI')
      .addTag('Catalogs', 'Catálogos y datos maestros')
      .addTag('Employees', 'Gestión de empleados')
      .addTag('Assignments', 'Asignación y devolución de activos')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Servidor NestJS corriendo en http://localhost:${port}`);
  if (!isProd) {
    console.log(`📚 Documentación Swagger: http://localhost:${port}/api-docs`);
  }
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
