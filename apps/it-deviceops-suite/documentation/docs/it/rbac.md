---
title: Administración - RBAC
sidebar_label: Admin RBAC
---

# Sistema de Administración y RBAC

IT Inventory incluye un sistema completo de administración de usuarios con control de acceso basado en roles (RBAC - Role-Based Access Control), permitiendo gestión granular de permisos.

## 📋 Visión General

El sistema de administración consta de 3 componentes principales:

### 👥 **Users (Usuarios)**
- Gestión de cuentas de usuario
- Asignación de roles por site
- Credenciales y autenticación

### 🔑 **Roles**
- Definición de roles del sistema
- Roles personalizados
- Agrupación de permisos

### 🛡️ **Permissions (Permisos)**
- Permisos granulares por módulo
- Control de acceso a recursos
- Operaciones específicas (read, create, update, delete)

---

## 🏗️ Arquitectura RBAC

### Modelo de Datos

```
User ←→ UserSiteRole ←→ Site
         ↓
      RolePermission ←→ Role
         ↓
      Permission
```

### Flujo de Autorización

1. **Usuario hace login** → Recibe JWT con roleId y siteId
2. **JWT incluye permisos** → Array de códigos de permisos
3. **Frontend valida** → `hasPermission('assets:create')`
4. **Backend valida** → `@RequirePermission('assets:create')`
5. **Acceso otorgado/denegado** → Según permisos del rol

---

## 👥 Users (Usuarios)

### Estructura de Datos

```typescript
interface User {
  id: number;
  userName: string;              // Nombre de usuario único
  email: string;                 // Email único
  password: string;              // Hash bcrypt (no visible)
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  userSites: UserSite[];         // Sites asignados
  userSiteRoles: UserSiteRole[]; // Roles por site
}
```

### API Endpoints

#### Listar Usuarios
```http
GET /api/users-admin
Authorization: Bearer {token}

Query Parameters:
- search: string (opcional) - Buscar por nombre/email
- isActive: boolean (opcional) - Filtrar por estado
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userName": "juan.perez",
      "email": "juan.perez@company.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "isActive": true,
      "userSites": [
        {
          "id": 1,
          "site": {
            "id": 1,
            "name": "Oficina Madrid",
            "code": "MAD"
          }
        }
      ],
      "userSiteRoles": [
        {
          "id": 1,
          "siteId": 1,
          "role": {
            "id": 1,
            "name": "Admin",
            "code": "ADMIN"
          }
        }
      ],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### Crear Usuario
```http
POST /api/users-admin
Authorization: Bearer {token}
Content-Type: application/json

{
  "userName": "maria.garcia",
  "email": "maria.garcia@company.com",
  "password": "SecurePass123!",
  "firstName": "María",
  "lastName": "García",
  "isActive": true,
  "siteIds": [1, 2],           // Sites asignados
  "userSiteRoles": [           // Roles por site
    {
      "siteId": 1,
      "roleId": 2              // IT en Madrid
    },
    {
      "siteId": 2,
      "roleId": 3              // Viewer en Barcelona
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 5,
    "userName": "maria.garcia",
    "email": "maria.garcia@company.com"
  }
}
```

#### Actualizar Usuario
```http
PUT /api/users-admin/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "María Victoria",
  "isActive": false,
  "userSiteRoles": [
    {
      "siteId": 1,
      "roleId": 1              // Promoción a Admin
    }
  ]
}
```

#### Obtener Usuario por ID
```http
GET /api/users-admin/:id
Authorization: Bearer {token}
```

#### Cambiar Contraseña
```http
PUT /api/users-admin/:id/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "newPassword": "NewSecurePass456!"
}
```

#### Exportar/Importar Usuarios
```http
GET    /api/users-admin/export/excel
GET    /api/users-admin/template/excel
POST   /api/users-admin/import/excel
```

---

## 🔑 Roles

### Estructura de Datos

```typescript
interface Role {
  id: number;
  name: string;                // Ej: "Admin", "IT Manager"
  code: string;                // Código único: "ADMIN", "IT_MANAGER"
  description: string;
  isSystem: boolean;           // Role del sistema (no editable)
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  rolePermissions: RolePermission[];
  permissions: Permission[];
}
```

### Roles del Sistema

Los siguientes roles vienen pre-configurados:

| Rol | Código | Descripción | Permisos |
|-----|--------|-------------|----------|
| **Admin** | ADMIN | Administrador total | Todos los permisos |
| **IT** | IT | Personal IT | Gestión de activos y asignaciones |
| **Viewer** | VIEWER | Solo lectura | Permisos de lectura únicamente |

### API Endpoints

#### Listar Roles
```http
GET /api/roles-admin
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "code": "ADMIN",
      "description": "Administrador con acceso total",
      "isSystem": true,
      "isActive": true,
      "permissions": [
        {
          "id": 1,
          "name": "Leer Activos",
          "code": "assets:read"
        },
        {
          "id": 2,
          "name": "Crear Activos",
          "code": "assets:create"
        }
        // ... más permisos
      ]
    }
  ]
}
```

#### Crear Rol Personalizado
```http
POST /api/roles-admin
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Asset Manager",
  "code": "ASSET_MANAGER",
  "description": "Gestión completa de activos",
  "permissionIds": [1, 2, 3, 4, 5, 6, 7, 8]
}
```

#### Actualizar Rol
```http
PUT /api/roles-admin/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Gestión de activos y empleados",
  "permissionIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

⚠️ **Nota**: No puedes editar roles del sistema (`isSystem: true`)

#### Obtener Rol por ID
```http
GET /api/roles-admin/:id
Authorization: Bearer {token}
```

#### Exportar/Importar Roles
```http
GET    /api/roles-admin/export/excel
GET    /api/roles-admin/template/excel
POST   /api/roles-admin/import/excel
```

---

## 🛡️ Permissions (Permisos)

### Estructura de Datos

```typescript
interface Permission {
  id: number;
  name: string;                // Ej: "Leer Activos"
  code: string;                // Código único: "assets:read"
  description: string;
  module: string;              // Módulo: "assets", "employees"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Permisos por Módulo

#### **Assets (Activos)**
- `assets:read` - Ver activos
- `assets:create` - Crear activos
- `assets:update` - Actualizar activos
- `assets:delete` - Eliminar activos
- `assets:export` - Exportar a Excel
- `assets:import` - Importar desde Excel

#### **Employees (Empleados)**
- `employees:read` - Ver empleados
- `employees:create` - Crear empleados
- `employees:update` - Actualizar empleados
- `employees:delete` - Eliminar empleados
- `employees:export` - Exportar empleados
- `employees:import` - Importar empleados

#### **Assignments (Asignaciones)**
- `assignments:read` - Ver asignaciones
- `assignments:create` - Crear asignaciones
- `assignments:update` - Actualizar asignaciones
- `assignments:delete` - Eliminar asignaciones
- `assignments:export` - Exportar asignaciones

#### **Catalogs (Catálogos)**
- `catalogs:read` - Ver catálogos
- `catalogs:create` - Crear en catálogos
- `catalogs:update` - Actualizar catálogos
- `catalogs:delete` - Eliminar de catálogos
- `catalogs:manage` - Gestión completa

#### **Users (Usuarios)**
- `users:read` - Ver usuarios
- `users:create` - Crear usuarios
- `users:update` - Actualizar usuarios
- `users:delete` - Eliminar usuarios
- `users:manage` - Gestión completa

#### **Roles**
- `roles:read` - Ver roles
- `roles:create` - Crear roles
- `roles:update` - Actualizar roles
- `roles:delete` - Eliminar roles
- `roles:manage` - Gestión completa

#### **Permissions**
- `permissions:read` - Ver permisos
- `permissions:manage` - Gestión completa

#### **Sites**
- `sites:read` - Ver sites
- `sites:create` - Crear sites
- `sites:update` - Actualizar sites
- `sites:delete` - Eliminar sites
- `sites:manage` - Gestión completa

### API Endpoints

#### Listar Permisos
```http
GET /api/permissions-admin
Authorization: Bearer {token}

Query Parameters:
- module: string (opcional) - Filtrar por módulo
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Leer Activos",
      "code": "assets:read",
      "description": "Permite ver la lista de activos",
      "module": "assets",
      "isActive": true
    },
    {
      "id": 2,
      "name": "Crear Activos",
      "code": "assets:create",
      "description": "Permite crear nuevos activos",
      "module": "assets",
      "isActive": true
    }
  ]
}
```

#### Crear Permiso
```http
POST /api/permissions-admin
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Aprobar Activos",
  "code": "assets:approve",
  "description": "Permite aprobar activos pendientes",
  "module": "assets"
}
```

#### Actualizar Permiso
```http
PUT /api/permissions-admin/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Permite aprobar o rechazar activos pendientes"
}
```

#### Obtener Permiso por ID
```http
GET /api/permissions-admin/:id
Authorization: Bearer {token}
```

#### Exportar/Importar Permisos
```http
GET    /api/permissions-admin/export/excel
GET    /api/permissions-admin/template/excel
POST   /api/permissions-admin/import/excel
```

---

## 🔗 Role-Permissions (Asignación)

### Obtener Permisos de un Rol
```http
GET /api/role-permissions/role/:roleId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "roleId": 2,
      "permissionId": 1,
      "permission": {
        "id": 1,
        "name": "Leer Activos",
        "code": "assets:read"
      }
    }
  ]
}
```

### Asignar Permiso a Rol
```http
POST /api/role-permissions
Authorization: Bearer {token}
Content-Type: application/json

{
  "roleId": 2,
  "permissionId": 5
}
```

### Quitar Permiso de Rol
```http
DELETE /api/role-permissions/:roleId/:permissionId
Authorization: Bearer {token}
```

---

## 💻 Validación de Permisos

### Backend - Guards y Decorators

```typescript
// Guard de autenticación JWT
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  
  // Decorador de permisos personalizado
  @RequirePermission('assets:read')
  @Get()
  async getAll() {
    // Solo accesible si el usuario tiene 'assets:read'
  }
  
  @RequirePermission('assets:create')
  @Post()
  async create() {
    // Solo accesible si el usuario tiene 'assets:create'
  }
}
```

### Frontend - Hook de Autorización

```typescript
// Hook personalizado
const useAuth = () => {
  const { permissions } = useAuthStore();
  
  const hasPermission = (code: string) => {
    return permissions.includes(code);
  };
  
  return { hasPermission };
};

// Uso en componentes
const AssetsPage = () => {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('assets:create') && (
        <button>Crear Activo</button>
      )}
      
      {hasPermission('assets:export') && (
        <button>Exportar</button>
      )}
    </div>
  );
};
```

---

## 🎯 Casos de Uso

### Ejemplo 1: Usuario con Múltiples Roles

**Escenario**: Juan es Admin en Madrid y Viewer en Barcelona

```json
{
  "user": {
    "id": 5,
    "userName": "juan.perez",
    "userSiteRoles": [
      {
        "siteId": 1,
        "site": { "name": "Madrid" },
        "role": { 
          "id": 1, 
          "name": "Admin",
          "permissions": ["assets:*", "employees:*", "users:*"]
        }
      },
      {
        "siteId": 2,
        "site": { "name": "Barcelona" },
        "role": { 
          "id": 3, 
          "name": "Viewer",
          "permissions": ["assets:read", "employees:read"]
        }
      }
    ]
  }
}
```

**Comportamiento:**
- En Madrid: Puede crear, editar, eliminar activos y usuarios
- En Barcelona: Solo puede ver activos y empleados
- Al cambiar de site, los permisos cambian automáticamente

---

### Ejemplo 2: Rol Personalizado "Asset Manager"

**Creación:**
```json
{
  "name": "Asset Manager",
  "code": "ASSET_MANAGER",
  "description": "Gestión completa de activos y asignaciones",
  "permissionIds": [
    1,  // assets:read
    2,  // assets:create
    3,  // assets:update
    4,  // assets:delete
    5,  // assets:export
    6,  // assets:import
    7,  // assignments:read
    8,  // assignments:create
    9,  // assignments:update
    10  // assignments:delete
  ]
}
```

**Asignación a Usuario:**
```json
{
  "userId": 10,
  "siteId": 1,
  "roleId": 5  // Asset Manager
}
```

---

### Ejemplo 3: Permisos Granulares

**Rol "Reporter" (Solo lectura + exportación):**
```json
{
  "name": "Reporter",
  "code": "REPORTER",
  "permissions": [
    "assets:read",
    "assets:export",
    "employees:read",
    "employees:export",
    "assignments:read",
    "assignments:export"
  ]
}
```

---

## 🔒 Seguridad y Best Practices

### 1. Principio de Mínimo Privilegio

✅ **BIEN**: Asignar solo los permisos necesarios
```json
{
  "role": "Support Desk",
  "permissions": ["assets:read", "employees:read"]
}
```

❌ **MAL**: Asignar todos los permisos "por si acaso"
```json
{
  "role": "Support Desk",
  "permissions": ["assets:*", "employees:*", "users:*"]
}
```

### 2. Roles del Sistema No Editables

Los roles `Admin`, `IT`, y `Viewer` son del sistema:
- ✅ Puedes asignarlos a usuarios
- ❌ No puedes modificar sus permisos
- ❌ No puedes eliminarlos

### 3. Validación en Múltiples Capas

```
Frontend ─→ Valida permisos (UX)
    ↓
Backend ─→ Valida permisos (Seguridad)
    ↓
Database ─→ Constraints y triggers
```

### 4. Auditoría de Cambios

Todos los cambios en Users/Roles/Permissions se auditan:
- `createdBy` / `updatedBy`
- `createdAt` / `updatedAt`

### 5. Contraseñas Seguras

- Mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número
- Hash bcrypt con 10 salt rounds
- No almacenar en texto plano

---

## 📊 Database Schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  module VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permissions (Many-to-Many)
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  CONSTRAINT ux_role_permission UNIQUE(role_id, permission_id)
);

-- User-Site-Roles
CREATE TABLE user_site_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT ux_user_site_role UNIQUE(user_id, site_id, role_id)
);
```

---

## 📖 Recursos Relacionados

- [Multi-Site Architecture](./multi-site-architecture.md)
- [Guía de Usuario: Administración](../user/admin-guide.md)
- [API Reference](./api-reference.md)

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo tener diferentes roles en diferentes sites?**
R: Sí, puedes ser Admin en un site y Viewer en otro.

**P: ¿Puedo modificar los permisos de un rol del sistema?**
R: No, los roles Admin, IT y Viewer no son editables.

**P: ¿Cómo cambio mi contraseña?**
R: Desde el perfil de usuario o contacta con un administrador.

**P: ¿Qué pasa si elimino un rol que está en uso?**
R: El sistema no permite eliminar roles asignados a usuarios.

**P: ¿Los permisos se validan en tiempo real?**
R: Sí, cada request valida los permisos contra el JWT actual.

**P: ¿Puedo crear permisos personalizados?**
R: Sí, pero también requiere implementación en el código backend/frontend.
