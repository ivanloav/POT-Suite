# IT DeviceOps Suite - Sistema de Control de Inventario IT

Sistema completo para la gestión de inventario IT, PDAs nominativas, asignaciones de activos a empleados, con autenticación JWT y control de permisos basado en roles (RBAC).

## 📚 Documentación

Este proyecto cuenta con **documentación técnica completa y actualizada** generada con Docusaurus. Encuentra arquitectura del sistema, guías de desarrollo, patrones de UI, control de concurrencia y más.

- **[📖 Ver Documentación Completa](./documentation/docs/)** - Documentación en formato Markdown
- **[🌐 Sitio de Documentación](https://ivanloav.github.io/IT-Inventory-POT/)** - Documentación interactiva (disponible cuando se despliegue)

### 🎯 Documentación Técnica (Para Desarrolladores)

- [🏗️ Arquitectura del Sistema](./documentation/docs/it/architecture.md) - Estructura completa: backend, frontend, base de datos
- [🐛 Manejo de Errores](./documentation/docs/it/error-handling.md) - Control de constraints UNIQUE y validaciones
- [🔒 Control de Concurrencia](./documentation/docs/it/concurrency-control.md) - Gestión de operaciones simultáneas
- [🎨 Patrones de UI](./documentation/docs/it/ui-patterns.md) - Guía de componentes frontend y mejores prácticas
- [💻 Instalación](./documentation/docs/it/installation.md) - Guía completa de instalación y configuración
- [🔧 Resolución de Problemas](./documentation/docs/it/troubleshooting.md) - Solución a problemas comunes
- [📡 Referencia de API](./documentation/docs/it/api-reference.md) - Documentación completa de la API REST
- [📑 Índice General](./documentation/docs/it/README.md) - Mapa completo de toda la documentación

### 👤 Documentación para Usuarios

- [🚀 Guía de Inicio](./documentation/docs/user/getting-started.md) - Primeros pasos en el sistema
- [✨ Funcionalidades](./documentation/docs/user/features.md) - Características y capacidades del sistema
- [❓ Preguntas Frecuentes](./documentation/docs/user/faq.md) - FAQ y respuestas comunes

### Ver la Documentación Localmente

Para visualizar la documentación con Docusaurus en tu máquina local:

```bash
cd documentation/website
npm install
npm start
```

La documentación estará disponible en `http://localhost:3000`

## 🚀 Características

- ✅ **Backend**: Node.js + NestJS + TypeScript + PostgreSQL
- ✅ **Frontend**: React + TypeScript + Vite + TailwindCSS
- ✅ **Autenticación**: JWT con sistema de roles y permisos
- ✅ **RBAC**: Control de acceso basado en roles (Admin, IT, Viewer)
- ✅ **Gestión de Activos**: PC, Laptops, Móviles, PDAs, Tablets, etc.
- ✅ **Asignaciones**: Control de activos asignados a empleados
- ✅ **Catálogos**: Tipos, Modelos, Sistemas Operativos, Secciones

## 📋 Requisitos Previos

- Node.js 18+ y npm
- PostgreSQL 14+
- Docker (opcional, si usas PostgreSQL en Docker)

## 🗄️ Configuración de la Base de Datos

Ya tienes la base de datos creada en tu servidor Ubuntu. Para crear un usuario de prueba, ejecuta:

```sql
-- Crear un usuario de prueba con rol admin
INSERT INTO app_users (email, password_hash)
VALUES ('admin@example.com', '$2a$10$YourHashedPasswordHere');

-- Obtener el ID del usuario recién creado
SELECT id FROM app_users WHERE email = 'admin@example.com';

-- Asignar rol de admin (reemplaza 'user-uuid-here' con el ID del usuario)
INSERT INTO user_roles (user_id, role_id)
SELECT 'user-uuid-here', id FROM roles WHERE code = 'admin';
```

O puedes usar bcrypt para generar el hash de la contraseña. El hash para la contraseña "admin123" es:
```
$2a$10$YourActualBcryptHashHere
```

## 🛠️ Instalación

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de base de datos
nano .env
```

Configuración del archivo `.env`:
```env
DB_HOST=tu-servidor-ubuntu-ip
DB_PORT=5432
DB_NAME=it_inventory
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_password_postgres

JWT_SECRET=cambia-esto-por-una-clave-secreta-segura
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

Iniciar el backend:
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## 🔐 Usuarios de Prueba

### Crear usuario desde el código

Puedes usar Node.js para crear el hash de la contraseña:

```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Luego inserta en la BD:
```sql
INSERT INTO app_users (email, password_hash)
VALUES ('admin@inventory.com', 'hash-generado-aqui');

INSERT INTO user_roles (user_id, role_id)
SELECT 
  (SELECT id FROM app_users WHERE email = 'admin@inventory.com'),
  (SELECT id FROM roles WHERE code = 'admin');
```

### Registrar desde la API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "admin123",
    "roleCode": "admin"
  }'
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Activos
- `GET /api/assets` - Listar activos
- `GET /api/assets/:id` - Obtener activo
- `POST /api/assets` - Crear activo
- `PUT /api/assets/:id` - Actualizar activo
- `POST /api/assets/:id/retire` - Dar de baja activo

### Empleados
- `GET /api/employees` - Listar empleados
- `GET /api/employees/:id` - Obtener empleado
- `POST /api/employees` - Crear empleado
- `PUT /api/employees/:id` - Actualizar empleado

### Asignaciones
- `POST /api/assignments` - Asignar activo
- `POST /api/assignments/:id/return` - Devolver activo
- `GET /api/assignments/employee/:id` - Activos de empleado

### Catálogos
- `GET /api/catalogs/asset-types` - Tipos de activos
- `GET /api/catalogs/sections` - Secciones
- `GET /api/catalogs/os-families` - Familias de SO
- `GET /api/catalogs/os-versions` - Versiones de SO
- `GET /api/catalogs/asset-models` - Modelos de activos
- `POST /api/catalogs/asset-models` - Crear modelo

## 🎯 Roles y Permisos

### Roles disponibles:
- **Admin**: Acceso completo al sistema
- **IT**: Gestión de activos y asignaciones (sin gestión de usuarios)
- **Viewer**: Solo lectura

### Permisos:
- `assets.read` - Ver activos
- `assets.create` - Crear activo
- `assets.update` - Editar activo
- `assets.retire` - Dar de baja activo
- `assignments.manage` - Gestionar asignaciones
- `catalogs.manage` - Gestionar catálogos
- `users.manage` - Gestionar usuarios y roles

## 📦 Estructura del Proyecto

```
it-inventory-pot/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── assetsController.ts
│   │   │   ├── employeesController.ts
│   │   │   ├── assignmentsController.ts
│   │   │   └── catalogsController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── permissions.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── assets.ts
│   │   │   ├── employees.ts
│   │   │   ├── assignments.ts
│   │   │   └── catalogs.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AssetsPage.tsx
│   │   │   └── EmployeesPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── assetsService.ts
│   │   │   ├── employeesService.ts
│   │   │   ├── assignmentsService.ts
│   │   │   └── catalogsService.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── scripts/
    └── create-DB.psql
```

## 🚀 Despliegue en Producción

### Backend

1. Compilar TypeScript:
```bash
cd backend
npm run build
```

2. Configurar variables de entorno en producción
3. Iniciar con PM2:
```bash
pm2 start dist/index.js --name it-inventory-api
```

### Frontend

1. Crear build de producción:
```bash
cd frontend
npm run build
```

2. Servir con Nginx o servidor estático

## 🔧 Desarrollo

### Ejecutar en modo desarrollo:

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## 📝 Notas

- El backend corre en el puerto 3000 por defecto
- El frontend corre en el puerto 5173 por defecto
- El frontend está configurado para hacer proxy de `/api` al backend
- Los tokens JWT expiran en 7 días por defecto
- Las contraseñas se hashean con bcrypt (10 rounds)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de features (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👤 Autor

Ivan - Control de Inventario IT

---

**¡Listo para usar! 🎉**
