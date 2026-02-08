---
sidebar_position: 1
slug: /devs/introduccion
---

# Introducción para desarrolladores

Bienvenido al manual técnico de GesPack. Aquí encontrarás toda la información necesaria para instalar, desarrollar, desplegar y mantener el proyecto.

## Estructura general

- **backend/**: API NestJS, lógica de negocio y acceso a datos.
- **frontend/**: Aplicación React/Vite, componentes y vistas.
- **docs/**: Documentación Docusaurus.
- **nginx/**: Configuración de proxy y seguridad.
- **postgresql/**: Scripts y configuración de base de datos.
- **packages/shared/**: Código compartido entre frontend y backend.
- **scripts/**: Utilidades de despliegue y mantenimiento.

## Tecnologías principales
- NestJS, TypeORM, PostgreSQL
- React, Vite, CSS Modules
- Docker, NGINX
- Docusaurus para documentación
- i18next para internacionalización

## Instalación rápida

```bash
# Backend
cd backend
pnpm install
pnpm start:dev

# Frontend
cd frontend
pnpm install
pnpm dev

# Documentación
cd docs
pnpm install
pnpm start
```

## Flujo de desarrollo
- Clona el repositorio y crea una rama desde `develop`.
- Instala dependencias con `pnpm`.
- Usa los scripts de despliegue en `scripts/` para entornos locales o productivos.
- Añade tus cambios siguiendo las convenciones de código y nomenclatura.
- Realiza pruebas antes de hacer merge.

## Despliegue
- Usa los archivos `docker-compose.yml` para levantar todos los servicios.
- Consulta los manuales de despliegue en la documentación para pasos detallados.

## API y endpoints
- La API principal está en `/backend/src/orders/` y `/users/`.
- Consulta los DTOs y servicios para saber qué datos puedes consumir.

## Componentes clave del frontend
- `src/components/`: Componentes reutilizables.
- `src/pages/`: Vistas principales.
- `src/hooks/`: Lógica de negocio y conexión con la API.

## Estilos e internacionalización
- Usa CSS Modules para estilos locales.
- Traducciones en `public/locales/`.

## Docker y NGINX
- Configura los servicios y el proxy en los archivos de la raíz y en `nginx/conf/`.

---

Esta documentación se irá ampliando. Para dudas técnicas, consulta el canal de soporte interno o abre un issue en GitHub.
