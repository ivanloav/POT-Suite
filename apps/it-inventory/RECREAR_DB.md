# Recrear Base de Datos IT Inventory

## Cambios Realizados

Se ha actualizado el sistema para usar correctamente la arquitectura **multi-site**:

- ✅ Eliminada referencia a la tabla `user_roles` (que no existe)
- ✅ Actualizado para usar `user_site_roles` (con site_id)
- ✅ Actualizado `AuthService` para manejar múltiples sites por usuario
- ✅ Token JWT ahora incluye información de sites
- ✅ Scripts SQL actualizados

## Pasos para Recrear la Base de Datos

### 1. Recrear la estructura de la base de datos

```bash
psql -h 192.168.50.13 -U Ivan -d it_inventory -f scripts/create-DB.psql
```

### 2. Insertar datos iniciales (catálogos, roles, permisos)

```bash
psql -h 192.168.50.13 -U Ivan -d it_inventory -f scripts/insert-DB.sql
```

### 3. Crear al menos un site

Antes de crear usuarios, necesitas al menos un site activo:

```sql
-- Conectarse a la base de datos
psql -h 192.168.50.13 -U Ivan -d it_inventory

-- Crear un site
INSERT INTO sites (code, name, is_active)
VALUES ('HQ', 'Sede Principal', true);

-- Verificar
SELECT * FROM sites;
```

### 4. Crear usuario admin

Ahora sí puedes crear el usuario admin que tendrá acceso al site:

```bash
psql -h 192.168.50.13 -U Ivan -d it_inventory -f scripts/crear_usuario_admin.sql
```

Este script:
- Crea el usuario `admin@inventory.com` con contraseña `admin123`
- Le asigna acceso al primer site activo
- Le asigna el rol de `admin` para ese site

### 5. Reiniciar el backend

```bash
cd backend
npm run start:dev
```

## Verificar que Funcionó

### Verificar estructura:

```sql
-- Ver sites
SELECT * FROM sites;

-- Ver usuarios y sus accesos
SELECT 
    u.id, 
    u.email, 
    u.is_active,
    s.code as site_code,
    s.name as site_name,
    r.code as role,
    r.name as role_name
FROM app_users u
JOIN user_sites us ON u.id = us.user_id
JOIN sites s ON us.site_id = s.site_id
JOIN user_site_roles usr ON u.id = usr.user_id AND s.site_id = usr.site_id
JOIN roles r ON usr.role_id = r.id;
```

### Probar login desde la aplicación:

```
Email: admin@inventory.com
Password: admin123
```

El token JWT ahora incluirá:
- `userId`
- `email`
- `roles` (array de códigos de roles)
- `permissions` (array de códigos de permisos)
- `sites` (array de objetos con siteId, code, name)

## Solución de Problemas

### Error: "No existe ningún site activo"

Crea un site antes de crear usuarios:

```sql
INSERT INTO sites (code, name, is_active)
VALUES ('HQ', 'Sede Principal', true);
```

### Error: "El usuario no tiene acceso a ningún site"

Asigna el usuario a un site:

```sql
INSERT INTO user_sites (user_id, site_id, is_active)
VALUES (
  (SELECT id FROM app_users WHERE email = 'admin@inventory.com'),
  (SELECT site_id FROM sites WHERE code = 'HQ'),
  true
);

-- Y asigna un rol para ese site
INSERT INTO user_site_roles (user_id, site_id, role_id)
VALUES (
  (SELECT id FROM app_users WHERE email = 'admin@inventory.com'),
  (SELECT site_id FROM sites WHERE code = 'HQ'),
  (SELECT id FROM roles WHERE code = 'admin')
);
```

## Notas Importantes

1. **El campo `updated_at` ahora funciona correctamente**:
   - En INSERT: queda en `NULL`
   - En UPDATE: se actualiza automáticamente con triggers

2. **Arquitectura Multi-Site**:
   - Un usuario puede tener acceso a múltiples sites
   - Un usuario puede tener diferentes roles en diferentes sites
   - El login devuelve información de todos los sites del usuario

3. **Registro de nuevos usuarios**:
   - El endpoint `/auth/register` ahora requiere especificar un `site_id`
   - Considera implementar un endpoint de administración para crear usuarios
