---
title: Referencia de API
sidebar_label: API Reference
---

# Referencia Completa de API

Documentación completa de todos los endpoints disponibles en la API REST de IT Inventory.

## 📋 Información General

- **URL Base:** `http://localhost:3000/api`
- **Formato:** JSON
- **Autenticación:** Bearer Token (JWT)
- **Codificación:** UTF-8
- **Versionado:** v1 (incluido en base URL)

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login`) requieren un token JWT válido:

```http
Authorization: Bearer {token}
```

### POST /auth/login

Inicia sesión y obtiene un access token. El refresh token se envía en una cookie `HttpOnly`.

**Request:**
```json
{
  "email": "juan.perez@company.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 5,
    "userName": "juan.perez",
    "email": "juan.perez@company.com",
    "roles": ["admin"],
    "permissions": ["assets.read", "assets.create"],
    "sites": [
      { "siteId": 1, "code": "HQ", "name": "Oficina Central" }
    ]
  }
}
```

**Notas:**
- El refresh token se guarda en cookie `HttpOnly` (`refresh_token`).
- El cliente debe enviar `withCredentials: true` en CORS.

**Rate Limit:** 5 intentos por IP cada 15 minutos

---

### POST /auth/refresh

Renueva el access token usando el refresh token en cookie `HttpOnly`.

**Request:**
```json
{}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

### POST /auth/logout

Cierra sesión y revoca el refresh token.

**Response:**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

### GET /auth/profile

Obtiene perfil del usuario autenticado.

**Response:**
```json
{
  "id": 5,
  "email": "juan.perez@company.com",
  "roles": ["admin"],
  "permissions": ["assets.read", "assets.create"],
  "sites": [
    { "siteId": 1, "code": "HQ", "name": "Oficina Central" }
  ]
}
```

---

## 📦 Assets (Activos)

### GET /assets

Lista activos con paginación.

**Query Parameters:**
- `page`: number - Página (default 1)
- `limit`: number - Tamaño de página (default 50)
- `status`: number - Filtrar por estado
- `typeId`: number - Filtrar por tipo
- `sectionId`: number - Filtrar por sección
- `sectionName`: string - Filtrar por nombre de sección (si no hay sectionId)
- `siteId`: number - Filtrar por site

**Permission:** `assets.read`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "assetTag": "AT001",
      "type": { "id": 1, "name": "Laptop" },
      "model": { "id": 5, "name": "Latitude 5530" },
      "status": { "id": 1, "name": "En Stock" },
      "site": { "siteId": 1, "code": "HQ", "name": "Oficina Central" },
      "current_assignment": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "pages": 3
  }
}
```

---

### GET /assets/:id

Obtiene asset por ID con todas las relaciones.

**Permission:** `assets.read`

**Response:**
```json
{
  "data": { "id": 1, "assetTag": "AT001", "type": { "id": 1, "name": "Laptop" } }
}
```

---

### POST /assets

Crea nuevo asset.

**Permission:** `assets.create`

**Request:**
```json
{
  "siteId": 1,
  "assetTag": "AT002",
  "typeId": 1,
  "modelId": 5,
  "statusId": 1,
  "serial": "SN002",
  "purchaseDate": "2024-01-20"
}
```

**Response:**
```json
{
  "message": "Activo creado exitosamente",
  "data": { "id": 2, ... }
}
```

---

### PUT /assets/:id

Actualiza asset existente.

**Permission:** `assets.update`

**Request:** Campos a actualizar (parcial)

**Response:**
```json
{
  "message": "Activo actualizado exitosamente",
  "data": { "id": 2, ... }
}
```

---

### POST /assets/:id/retire

Retira asset (cambio de estado).

**Permission:** `assets.retire`

**Request:**
```json
{
  "reason": "Equipo obsoleto"
}
```

---

### GET /assets/template/excel

Descarga plantilla de importación.

**Permission:** `assets.read`

**Response:** Archivo Excel

---

### POST /assets/import-excel

Importa assets desde Excel.

**Permission:** `assets.create`

**Request:**
```json
{
  "assets": [ ... ]
}
```

**Response:**
```json
{
  "message": "Activos importados exitosamente",
  "data": {
    "insertados": 45,
    "duplicados": [],
    "errores": []
  }
}
```

---

### POST /assets/import-excel/update-duplicates

Actualiza duplicados después de importación.

**Permission:** `assets.update`

**Request:**
```json
{
  "duplicates": [...]
}
```

---

## 👥 Employees (Empleados)

### GET /employees

Lista empleados.

**Query Parameters:**
- `siteId`: number
- `isActive`: boolean

**Permission:** `employees.read`

**Response:**
```json
{
  "data": [
    { "id": 1, "firstName": "Carlos", "lastName": "Ruiz", "email": "carlos@company.com" }
  ]
}
```

---

### GET /employees/:id

Obtiene empleado por ID.

**Permission:** `employees.read`

**Response:**
```json
{
  "data": { "id": 1, "firstName": "Carlos", "lastName": "Ruiz", "email": "carlos@company.com" }
}
```

---

### POST /employees

Crea empleado.

**Permission:** `employees.create`

**Request:**
```json
{
  "firstName": "Carlos",
  "lastName": "Ruiz",
  "email": "carlos.ruiz@company.com",
  "siteId": 1,
  "position": "Desarrollador Senior",
  "employeeCode": "EMP-001"
}
```

**Response:**
```json
{
  "message": "Empleado creado exitosamente",
  "data": { "id": 1, ... }
}
```

---

### PUT /employees/:id

Actualiza empleado.

**Permission:** `employees.update`

**Response:**
```json
{
  "message": "Empleado actualizado exitosamente",
  "data": { "id": 1, ... }
}
```

---

### DELETE /employees/:id

Soft delete de empleado.

**Permission:** `employees.delete`

**Response:**
```json
{
  "message": "Empleado eliminado exitosamente"
}
```

---

### GET /employees/export/excel
### GET /employees/template/excel
### POST /employees/import-excel
### POST /employees/update-duplicates-excel

Endpoints de Excel (similar a assets).

**Permission:** `employees.read` / `employees.create` / `employees.update`

---

## 📋 Assignments (Asignaciones)

### GET /assignments

Lista asignaciones.

**Permission:** `assignments.read`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "assetId": 5,
      "employeeId": 10,
      "assignedAt": "2024-01-15T10:00:00.000Z",
      "returnedAt": null
    }
  ]
}
```

---

### POST /assignments

Crea nueva asignación.

**Permission:** `assignments.create`

**Request:**
```json
{
  "siteId": 1,
  "assetId": 5,
  "employeeId": 10,
  "assignedAt": "2024-01-15",
  "comment": "Asignación temporal"
}
```

**Response:**
```json
{
  "message": "Activo asignado exitosamente",
  "data": { "id": 1, ... }
}
```

---

### POST /assignments/:id/return

Registra devolución de activo.

**Permission:** `assignments.update`

**Request:**
```json
{
  "returnedAt": "2024-06-15T14:30:00Z",
  "comment": "Devolución por cambio de equipo"
}
```

**Response:**
```json
{
  "message": "Activo devuelto exitosamente",
  "data": { "id": 1, ... }
}
```

---

### GET /assignments/employee/:employeeId

Asignaciones de un empleado específico.

**Permission:** `assignments.read`

---

### GET /assignments/export/excel
### GET /assignments/template/excel
### POST /assignments/import/excel

Endpoints de Excel.

**Permission:** `assignments.read` / `assignments.create`

---

## 📚 Catalogs (Catálogos)

Todos los endpoints de catálogos están bajo `/catalogs`.

### GET /catalogs/asset-types
**Response:**
```json
{ "data": [ ... ] }
```

### GET /catalogs/asset-statuses
**Response:**
```json
{ "data": [ ... ] }
```

### GET /catalogs/sections
**Query Parameters:**
- `siteId`: number

**Response:**
```json
{ "data": [ ... ] }
```

### GET /catalogs/asset-brands
**Response:**
```json
{ "data": [ ... ] }
```

### POST /catalogs/asset-brands
**Auth:** JWT requerido

**Response:**
```json
{
  "message": "Marca creada exitosamente",
  "data": { "id": 1, ... }
}
```

### GET /catalogs/asset-models
**Query Parameters:**
- `typeId`: number

**Response:**
```json
{ "data": [ ... ] }
```

### POST /catalogs/asset-models
**Auth:** JWT requerido

**Response:**
```json
{
  "message": "Modelo creado exitosamente",
  "data": { "id": 1, ... }
}
```

### GET /catalogs/os-families
**Response:**
```json
{ "data": [ ... ] }
```

### GET /catalogs/cpus
**Query Parameters:**
- `brandId`: number

**Response:**
```json
{ "data": [ ... ] }
```

### GET /catalogs/ram-options
**Query Parameters:**
- `brandId`: number

**Response:**
```json
{ "data": [ ... ] }
```

### GET /catalogs/storage-options
**Response:**
```json
{ "data": [ ... ] }
```

**Nota:** Para endpoints administrativos adicionales (sites, roles, usuarios, compatibilidad, etc.), consulta Swagger en `/api-docs` cuando esté disponible en entorno de desarrollo.

## Códigos de Error

- `400` - Bad Request: Datos inválidos o faltantes
- `401` - Unauthorized: Token no válido o expirado
- `403` - Forbidden: Sin permisos para la operación
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con el estado actual
- `500` - Internal Server Error: Error del servidor

## Rate Limiting

Rate limiting aplicado únicamente en `POST /auth/login`:
- **Límite:** 5 intentos fallidos por IP cada 15 minutos

## 📖 Recursos Relacionados

- [Multi-Site Architecture](./multi-site-architecture.md)
- [RBAC System](./rbac.md)
- [Hardware Catalogs](./hardware-catalogs.md)
- [Excel Import/Export](./excel-import-export.md)
- [Error Handling](./error-handling.md)
