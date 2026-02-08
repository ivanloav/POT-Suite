import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IT Inventory API',
      version: '1.0.0',
      description: 'API REST para gestión de inventario de TI con sistema de asignaciones y control de activos',
      contact: {
        name: 'Soporte Técnico',
        email: 'soporte@itinventory.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.itinventory.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT recibido al hacer login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de error',
            },
            statusCode: {
              type: 'integer',
              description: 'Código de estado HTTP',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y gestión de usuarios',
      },
      {
        name: 'Assets',
        description: 'Gestión de activos de TI',
      },
      {
        name: 'Catalogs',
        description: 'Catálogos y datos maestros (tipos, marcas, modelos, secciones)',
      },
      {
        name: 'Employees',
        description: 'Gestión de empleados',
      },
      {
        name: 'Assignments',
        description: 'Asignación y devolución de activos a empleados',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/**/dto/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
