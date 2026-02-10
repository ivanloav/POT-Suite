# Operations Hub

**Operations Hub** es un portal centralizado de autenticación corporativa que unifica el acceso a múltiples aplicaciones de la organización. Los usuarios inician sesión una vez y pueden acceder a todas las aplicaciones para las que tienen permisos.

## 🏗️ Arquitectura del Monorepo

Este proyecto es un monorepo que contiene las siguientes aplicaciones:

### 📦 Aplicaciones

#### 1. **Operations Hub** (`apps/operations-hub`)
Portal centralizado de autenticación con Single Sign-On (SSO).
- Frontend en React 18 + TypeScript + Vite + Tailwind CSS
- Sistema de autenticación JWT con cookies httpOnly
- Selector dinámico de aplicaciones según permisos de usuario

#### 2. **GesPack** (`apps/gespack`)
Sistema de gestión de paquetería y logística.
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: NestJS + TypeScript + PostgreSQL
- Control de paquetes, rutas, incidencias y órdenes

#### 3. **IT DeviceOps Suite** (`apps/it-deviceops-suite`)
Sistema de gestión de inventario IT con control de activos y asignaciones.
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: NestJS + TypeScript + PostgreSQL
- Gestión de dispositivos, asignaciones, empleados y catálogos
- Sistema RBAC (Admin, IT, Viewer)

### 🎨 Paquetes Compartidos

#### **@pot/ui-kit** (`packages/ui-kit`)
Librería de componentes UI compartidos entre todas las aplicaciones:
- `OperationsHubLogin` - Componente de login unificado
- `SuiteSidebar` - Navegación lateral compartida
- `SuiteTopbar` - Barra superior con acciones comunes
- Estilos consistentes con Tailwind CSS

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL 16
- npm or pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd OperationsHub

# Instalar dependencias (en workspaces)
npm install

# Configurar la base de datos
docker-compose -f docker-compose.db.yml up -d
```

### Scripts Disponibles

```bash
# Operations Hub (portal de login)
npm run hub:dev

# GesPack
npm run gespack:dev           # Frontend + Backend
npm run gespack:frontend:dev
npm run gespack:backend:dev

# IT DeviceOps Suite
npm run it:dev                # Frontend + Backend
npm run it:frontend:dev
npm run it:backend:dev
```

## 🔐 Sistema de Autenticación

1. **Login Centralizado**: Usuario accede a Operations Hub (puerto 3003)
2. **Validación**: Se valida en la tabla `auth.users`
3. **Lista de Apps**: Se retorna la lista de aplicaciones permitidas desde `auth.user_apps`
4. **Selector**: Si tiene acceso a múltiples apps, elige una
5. **Redirección**: Se redirige a la aplicación con cookie JWT `access_token`
6. **SSO**: La aplicación valida la cookie y permite el acceso sin login adicional

## 🗄️ Base de Datos

PostgreSQL con 3 esquemas:

- **`auth`**: Usuarios, apps, roles, permisos (compartido)
- **`gespack`**: Datos de paquetería
- **`it`**: Datos de inventario IT

Inicialización automática con Docker Compose en `db/init/*.sql`

## 📂 Estructura del Proyecto

```
OperationsHub/
├── apps/
│   ├── operations-hub/       # Portal centralizado de login
│   │   └── frontend/
│   ├── gespack/              # App de paquetería
│   │   ├── frontend/
│   │   └── backend/
│   └── it-deviceops-suite/   # App de inventario IT
│       ├── frontend/
│       ├── backend/
│       └── documentation/
├── packages/
│   └── ui-kit/               # Componentes compartidos
├── db/
│   └── init/                 # Scripts de inicialización DB
│       ├── 00_schemas.sql    # Esquemas y extensiones
│       ├── 10_gespack.sql    # Schema GesPack
│       ├── 20_it.sql         # Schema IT
│       ├── 21_it_seed.sql    # Seeds IT
│       └── 30_auth.sql       # Schema auth + seeds
└── docker-compose.db.yml     # Base de datos PostgreSQL
```

## 🛠️ Tecnologías

- **Frontend**: React 18/19, TypeScript, Vite, Tailwind CSS
- **Backend**: NestJS, TypeScript, Express
- **Database**: PostgreSQL 16
- **Auth**: JWT (cookies httpOnly)
- **UI**: Tailwind CSS, Lucide Icons
- **State**: Zustand
- **HTTP Client**: Axios, @tanstack/react-query

## 📝 Variables de Entorno

### Operations Hub Frontend
```env
VITE_APP_GESPACK_URL=http://localhost:3001
VITE_APP_IT_URL=http://localhost:5173
```

### Backends
```env
DATABASE_URL=postgresql://Ivan:password@localhost:5433/operations_hub
JWT_SECRET=your-secret-key
SUITE_JWT_SECRET=your-suite-secret-key
PORT=3000
```

## 🔄 Migración desde POT-Suite

Este proyecto fue renombrado de **POT-Suite** a **Operations Hub** para mejor claridad:
- `POT Suite` → `Operations Hub`
- `IT Inventory` → `IT DeviceOps Suite`
- `pot-suite` → `operations-hub` (en código)
- `it-inventory` → `it-deviceops` (en código)

## 📚 Documentación

- [GesPack README](./apps/gespack/README.md)
- [IT DeviceOps Suite README](./apps/it-deviceops-suite/README.md)
- [IT DeviceOps Suite - Documentación Completa](./apps/it-deviceops-suite/documentation/docs/)

## 🤝 Contribución

Este es un proyecto interno de la organización. Para contribuir, consulta con el equipo de desarrollo.

## 📄 Licencia

Proyecto propietario - Todos los derechos reservados © 2024-2026

---

**Desarrollado por**: Parcel on Time IT Team
