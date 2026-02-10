---
title: Arquitectura Multi-Site
sidebar_label: Multi-Site
---

# Arquitectura Multi-Site

IT Inventory soporta **múltiples sitios/sucursales** dentro de una única instalación, permitiendo que una organización gestione su inventario IT desde diferentes ubicaciones geográficas de forma centralizada pero segmentada.

## 📋 Conceptos Clave

### ¿Qué es un Site?

Un **Site** (sitio/sucursal) representa una ubicación física de la organización:
- Oficina central
- Sucursal regional
- Almacén
- Centro de distribución
- Oficina remota

### Características del Sistema Multi-Site

✅ **Segmentación de Datos**: Cada site tiene su propio inventario de activos, empleados y asignaciones

✅ **Control de Acceso**: Los usuarios tienen roles específicos por site (puede ser Admin en un site y Viewer en otro)

✅ **Filtrado Automático**: El sistema filtra automáticamente los datos según el site activo del usuario

✅ **Gestión Centralizada**: Los administradores pueden ver y gestionar múltiples sites desde una sola interfaz

✅ **Catálogos Globales**: Los catálogos (marcas, modelos, tipos, etc.) son compartidos entre todos los sites

---

## 🏗️ Arquitectura Técnica

### Entidades Principales

#### 1. Site Entity
```typescript
@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 20, unique: true })
  code: string; // Código único del site

  @Column({ default: true })
  isActive: boolean;

  // Audit fields
  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
```

#### 2. UserSite Entity
Relación muchos a muchos entre usuarios y sites:
```typescript
@Entity('user_site')
export class UserSite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'site_id' })
  siteId: number;

  @ManyToOne(() => User, (user) => user.userSites)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site: Site;
}
```

#### 3. UserSiteRole Entity
Roles específicos por site:
```typescript
@Entity('user_site_roles')
export class UserSiteRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'site_id' })
  siteId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
```

### Filtrado Automático por Site

Todas las entidades principales tienen un campo `siteId`:
- ✅ Assets
- ✅ Employees
- ✅ Assignments
- ✅ Sections (departamentos)

Ejemplo en Asset Entity:
```typescript
@Entity('assets')
export class Asset {
  // ... otros campos

  @Column({ name: 'site_id' })
  siteId: number;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site: Site;
}
```

### Query Automático por Site

En los servicios, las queries se filtran automáticamente:

```typescript
// Backend Service Example
async getAll(userId: number, siteId: number): Promise<Asset[]> {
  const user = await this.userRepository.findOne({ 
    where: { id: userId },
    relations: ['userSites']
  });

  // Filtrar por site
  return this.assetRepository.find({
    where: { siteId }, // ← Filtro automático
    relations: ['type', 'brand', 'model', 'status', 'site'],
    order: { id: 'DESC' }
  });
}
```

---

## 🔐 Control de Acceso por Site

### Roles por Site

Un usuario puede tener **diferentes roles en diferentes sites**:

| Usuario | Site Madrid | Site Barcelona | Site Valencia |
|---------|-------------|----------------|---------------|
| Juan    | Admin       | -              | -             |
| María   | IT          | IT             | IT            |
| Pedro   | Viewer      | Admin          | Viewer        |

### JWT Payload

El token JWT incluye información del site activo:

```typescript
{
  userId: 1,
  userName: 'juan.perez',
  siteId: 2, // Site activo actual
  roleId: 1,
  roleName: 'Admin',
  permissions: ['assets:read', 'assets:create', ...]
}
```

### Cambio de Site Activo

El usuario puede cambiar de site desde el frontend:

```typescript
// Frontend: src/store/authStore.ts
const authStore = create<AuthState>((set) => ({
  // ...
  setSelectedSite: (siteId) => {
    set({ selectedSiteId: siteId });
    // Las queries se actualizan automáticamente con el nuevo siteId
  },
}));
```

---

## 🛠️ API Endpoints

### Sites Management

#### 1. Listar Sites del Usuario
```http
GET /api/sites/user
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Oficina Madrid",
      "code": "MAD",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Sucursal Barcelona",
      "code": "BCN",
      "isActive": true,
      "createdAt": "2024-01-20T10:00:00.000Z"
    }
  ]
}
```

#### 2. Listar Todos los Sites (Admin)
```http
GET /api/sites
Authorization: Bearer {token}
```

#### 3. Obtener Site por ID
```http
GET /api/sites/:id
Authorization: Bearer {token}
```

#### 4. Crear Nuevo Site
```http
POST /api/sites
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Oficina Valencia",
  "code": "VLC",
  "isActive": true
}
```

#### 5. Actualizar Site
```http
PUT /api/sites/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Oficina Valencia - Centro",
  "code": "VLC",
  "isActive": true
}
```

#### 6. Exportar Sites a Excel
```http
GET /api/sites/export/excel
Authorization: Bearer {token}
```

#### 7. Descargar Plantilla de Importación
```http
GET /api/sites/template/excel
Authorization: Bearer {token}
```

#### 8. Importar Sites desde Excel
```http
POST /api/sites/import/excel
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [archivo.xlsx]
```

---

## 💻 Frontend: Selector de Site

### Ubicación
El selector de site está en el **header de la aplicación**, siempre visible:

```tsx
// src/components/Layout/Header.tsx
<select 
  value={selectedSiteId} 
  onChange={(e) => setSelectedSite(Number(e.target.value))}
  className="site-selector"
>
  {userSites.map(site => (
    <option key={site.id} value={site.id}>
      {site.name}
    </option>
  ))}
</select>
```

### Comportamiento

1. **Al hacer login**: Se selecciona automáticamente el primer site del usuario
2. **Al cambiar site**: Todas las queries se recargan con el nuevo `siteId`
3. **Persistencia**: El site seleccionado se guarda en localStorage
4. **Permisos**: Los permisos cambian según el rol en el site activo

---

## 🔄 Flujo Completo

### Ejemplo: Crear Asset en Site Específico

1. **Usuario hace login** → Recibe JWT con `siteId: 1` (Madrid)
2. **Selecciona site** → Cambia a `siteId: 2` (Barcelona)
3. **Navega a Assets** → Query automática: `GET /api/assets?siteId=2`
4. **Crea asset** → Request body incluye: `{ ..., siteId: 2 }`
5. **Backend valida** → Usuario tiene permiso en site 2
6. **Asset creado** → Visible solo en site Barcelona

### Ejemplo: Usuario Multi-Site

```
Juan Pérez (userId: 5)
├─ Site Madrid (siteId: 1) → Role: Admin
│  ├─ Assets: 150
│  ├─ Employees: 45
│  └─ Permissions: assets:*, employees:*, users:*
│
└─ Site Barcelona (siteId: 2) → Role: Viewer
   ├─ Assets: 200 (solo lectura)
   ├─ Employees: 60 (solo lectura)
   └─ Permissions: assets:read, employees:read
```

---

## ⚠️ Consideraciones Importantes

### Seguridad

✅ **Validación en Backend**: SIEMPRE validar que el usuario tiene acceso al site solicitado

```typescript
// Ejemplo de validación
async validateUserSiteAccess(userId: number, siteId: number): Promise<boolean> {
  const userSite = await this.userSiteRepository.findOne({
    where: { userId, siteId }
  });
  
  if (!userSite) {
    throw new ForbiddenException('Usuario no tiene acceso a este site');
  }
  
  return true;
}
```

✅ **Filtrado Obligatorio**: Nunca devolver datos sin filtrar por `siteId`

❌ **Evitar**: 
```typescript
// MAL - Sin filtro de site
return this.assetRepository.find();
```

✅ **Correcto**:
```typescript
// BIEN - Con filtro de site
return this.assetRepository.find({ where: { siteId } });
```

### Performance

- Los índices en `site_id` son críticos para performance
- Considerar cache de sites del usuario (ya están en JWT)
- Paginación es importante en sites con muchos activos

### Catálogos Globales

Los catálogos son **compartidos entre sites**:
- ✅ Asset Brands
- ✅ Asset Models
- ✅ Asset Types
- ✅ CPUs, RAMs, Storage
- ✅ OS Families/Versions

Los **departments/sections** son **específicos por site**:
- ❌ Sections (tienen `siteId`)

---

## 📊 Database Schema

```sql
-- Sites table
CREATE TABLE sites (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Site relation
CREATE TABLE user_site (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  site_id INTEGER NOT NULL REFERENCES sites(id),
  CONSTRAINT ux_user_site UNIQUE(user_id, site_id)
);

-- User-Site-Role relation
CREATE TABLE user_site_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  site_id INTEGER NOT NULL REFERENCES sites(id),
  role_id INTEGER NOT NULL REFERENCES roles(id),
  CONSTRAINT ux_user_site_role UNIQUE(user_id, site_id, role_id)
);

-- Assets with site_id
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  -- ... otros campos
  site_id INTEGER NOT NULL REFERENCES sites(id),
  -- ...
);

CREATE INDEX idx_assets_site_id ON assets(site_id);
```

---

## 🎯 Best Practices

### 1. Siempre Incluir siteId en Queries

```typescript
// ✅ BIEN
const assets = await this.assetRepository.find({
  where: { siteId: user.selectedSiteId }
});
```

### 2. Validar Acceso al Site

```typescript
// ✅ BIEN
if (!user.sites.includes(requestedSiteId)) {
  throw new ForbiddenException('No access to this site');
}
```

### 3. Incluir Site en Responses

```typescript
// ✅ BIEN - Para contexto
{
  "asset": {...},
  "site": {
    "id": 1,
    "name": "Oficina Madrid",
    "code": "MAD"
  }
}
```

### 4. Cache de Sites del Usuario

```typescript
// ✅ BIEN - En Zustand store
const userSites = useAuthStore((state) => state.userSites);
```

---

## 📖 Recursos Relacionados

- [Guía de Usuario: Gestión de Sites](../user/sites-management.md)
- [API Reference: Sites Endpoints](./api-reference.md#sites)
- [Arquitectura del Sistema](./architecture.md)
- [Control de Acceso y Roles](./rbac.md)

---

## ❓ Preguntas Frecuentes

**P: ¿Puede un usuario estar en múltiples sites?**
R: Sí, un usuario puede tener acceso a múltiples sites con roles diferentes en cada uno.

**P: ¿Los catálogos son específicos por site?**
R: No, los catálogos (marcas, modelos, tipos, CPUs, etc.) son globales y compartidos. Solo las Sections son específicas por site.

**P: ¿Cómo cambio de site activo?**
R: Usa el selector de site en el header de la aplicación.

**P: ¿Qué pasa si intento acceder a un asset de otro site?**
R: El backend devuelve un error 403 Forbidden si no tienes acceso a ese site.

**P: ¿Puedo mover un asset de un site a otro?**
R: Sí, editando el asset y cambiando el campo `siteId` (requiere permisos en ambos sites).
