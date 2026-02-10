# Manejo de Errores de Constraints UNIQUE

## 📋 Resumen

Se implementó manejo robusto de errores de violación de constraints UNIQUE de PostgreSQL en todos los servicios del backend. Cuando un usuario intenta crear o actualizar un registro que violaría un constraint UNIQUE, ahora recibe un mensaje descriptivo en español en lugar del genérico "Internal server error".

## 🔧 Implementación

### Patrón Utilizado

```typescript
try {
  const saved = await this.repository.save(entity);
  return saved;
} catch (error: any) {
  if (error.code === '23505') { // PostgreSQL UNIQUE constraint violation
    const constraintName = error.constraint;
    if (constraintName?.includes('ux_specific_constraint')) {
      throw new ConflictException('Mensaje descriptivo en español');
    }
    throw new ConflictException('Mensaje genérico de respaldo');
  }
  throw error; // Re-throw otros errores
}
```

### Código de Error PostgreSQL

- **23505**: Violación de constraint UNIQUE

### Excepciones NestJS

- **ConflictException**: HTTP 409 - Usado para duplicados/conflictos
- **NotFoundException**: HTTP 404 - Usado cuando no se encuentra un registro

## 📁 Servicios Actualizados

### 1. Assets (Activos)
**Archivo**: `backend/src/assets/assets.service.ts`

**Constraints**:
- `ux_assets_site_tag`: (site_id, asset_tag)
- `ux_assets_site_serial`: (site_id, serial)
- `ux_assets_site_imei`: (site_id, imei)

**Mensajes**:
- "Ya existe un activo con la etiqueta '[tag]' en este sitio"
- "Ya existe un activo con el número de serie '[serial]' en este sitio"
- "Ya existe un activo con el IMEI '[imei]' en este sitio"

---

### 2. Employees (Empleados)
**Archivo**: `backend/src/employees/employees.service.ts`

**Constraints**:
- `ux_employees_site_email`: (site_id, email)
- `ux_employees_site_fullname`: (site_id, first_name, last_name, second_last_name)

**Mensajes**:
- "Ya existe un empleado con el email '[email]' en este sitio"
- "Ya existe un empleado con el nombre '[fullName]' en este sitio"

---

### 3. Users (Usuarios)
**Archivo**: `backend/src/users-admin/users-admin.service.ts`

**Constraints**:
- Email único (UNIQUE en tabla app_users)

**Mensajes**:
- "El email ya está registrado"

**Nota**: Este servicio ya tenía validación manual con `findOne()` antes de insertar, pero se agregó try-catch como respaldo para capturar errores de BD.

---

### 4. Roles
**Archivo**: `backend/src/roles-admin/roles-admin.service.ts`

**Constraints**:
- Code único (UNIQUE en tabla roles)

**Mensajes**:
- "El código de rol ya existe"

**Nota**: Similar a Users, tenía validación manual pero se agregó respaldo de BD.

---

### 5. Permissions (Permisos)
**Archivo**: `backend/src/permissions-admin/permissions-admin.service.ts`

**Constraints**:
- Code único (UNIQUE en tabla permissions)

**Mensajes**:
- "El código de permiso ya existe"

---

### 6. Sections (Secciones)
**Archivo**: `backend/src/sections/sections.service.ts`

**Constraints**:
- `ux_sections_site_name`: (site_id, name)

**Mensajes**:
- "Ya existe una sección con el nombre '[name]' en este sitio"

---

### 7. Asset Models (Modelos de Activos)
**Archivo**: `backend/src/asset-models/asset-models.service.ts`

**Constraints**:
- `ux_asset_models`: (type_id, brand_id, model)

**Mensajes**:
- "Ya existe un modelo con ese nombre para esta combinación de tipo y marca"

---

### 8. Asset CPUs
**Archivo**: `backend/src/asset-cpu/asset-cpu.service.ts`

**Constraints**:
- `ux_asset_cpus`: (vendor_id, model)

**Mensajes**:
- "Ya existe un CPU con ese modelo para este fabricante"

---

### 9. Asset RAM
**Archivo**: `backend/src/asset-ram/asset-ram.service.ts`

**Constraints**:
- `ux_asset_ram`: (capacity_gb, mem_type_id, speed_mts, form_factor_id)

**Mensajes**:
- "Ya existe una RAM con esa configuración"

---

### 10. Asset Storage
**Archivo**: `backend/src/asset-storage/asset-storage.service.ts`

**Constraints**:
- `ux_asset_storage`: (capacity_gb, drive_type_id, interface_id, form_factor_id)

**Mensajes**:
- "Ya existe un almacenamiento con esa configuración"

---

### 11. OS Versions (Versiones de SO)
**Archivo**: `backend/src/asset-os-versions/asset-os-versions.service.ts`

**Constraints**:
- `ux_os_versions`: (os_family_id, name)

**Mensajes**:
- "Ya existe una versión con ese nombre para esta familia de SO"

---

## ✅ Verificación

### Compilación
```bash
cd backend
npm run build
```
✅ **0 errores de compilación**

### Pruebas Manuales

1. **Crear activo con etiqueta duplicada**:
   - Antes: "Internal server error"
   - Ahora: "Ya existe un activo con la etiqueta 'LAP-001' en este sitio"

2. **Crear empleado con email duplicado**:
   - Antes: "Internal server error"
   - Ahora: "Ya existe un empleado con el email 'juan@empresa.com' en este sitio"

3. **Crear rol con código duplicado**:
   - Antes: "Internal server error"
   - Ahora: "El código de rol ya existe"

## 📚 Documentación Relacionada

- [Control de Concurrencia](./CONTROL_CONCURRENCIA.md) - Estrategia general de concurrencia
- [Arquitectura Backend](./backend/ARQUITECTURA.md) - Patrones y convenciones

## 🔍 Constraints UNIQUE en la Base de Datos

Referencia completa de todos los constraints definidos en `scripts/create-DB.sql`:

| Tabla | Constraint | Columnas | Servicio |
|-------|-----------|----------|----------|
| assets | ux_assets_site_tag | (site_id, asset_tag) | assets.service.ts |
| assets | ux_assets_site_serial | (site_id, serial) | assets.service.ts |
| assets | ux_assets_site_imei | (site_id, imei) | assets.service.ts |
| employees | ux_employees_site_email | (site_id, email) | employees.service.ts |
| employees | ux_employees_site_fullname | (site_id, first_name, last_name, second_last_name) | employees.service.ts |
| sections | ux_sections_site_name | (site_id, name) | sections.service.ts |
| os_versions | ux_os_versions | (os_family_id, name) | asset-os-versions.service.ts |
| asset_models | ux_asset_models | (type_id, brand_id, model) | asset-models.service.ts |
| asset_cpus | ux_asset_cpus | (vendor_id, model) | asset-cpu.service.ts |
| asset_ram | ux_asset_ram | (capacity_gb, mem_type_id, speed_mts, form_factor_id) | asset-ram.service.ts |
| asset_storage | ux_asset_storage | (capacity_gb, drive_type_id, interface_id, form_factor_id) | asset-storage.service.ts |

## 🎯 Beneficios

1. **Experiencia de Usuario Mejorada**: Mensajes claros en español que explican exactamente qué salió mal
2. **Debugging Más Fácil**: Los logs muestran mensajes descriptivos en lugar de stack traces genéricos
3. **Consistencia**: Todos los servicios usan el mismo patrón de manejo de errores
4. **Seguridad**: No se exponen detalles técnicos de la BD al usuario final
5. **Mantenibilidad**: Fácil agregar nuevos constraints siguiendo el patrón establecido

## 📝 Notas de Implementación

### TypeScript Type Safety

Se usó `error: any` en todos los bloques catch para acceder a las propiedades específicas de PostgreSQL:

```typescript
} catch (error: any) {
  if (error.code === '23505') {
    const constraintName = error.constraint;
```

Esto es necesario porque TypeScript por defecto tipea `error` como `unknown`, y necesitamos acceder a propiedades específicas de los errores de PostgreSQL.

### Validación Preventiva vs. Captura de Errores

Algunos servicios (users, roles, permissions) tienen **doble validación**:

1. **Validación preventiva**: `findOne()` antes de `save()` para verificar duplicados
2. **Captura de errores**: Try-catch como respaldo por si la validación falla o hay race conditions

Esto proporciona:
- ✅ Mejor UX (mensaje inmediato sin esperar el error de BD)
- ✅ Protección contra race conditions
- ✅ Seguridad adicional en escenarios de alta concurrencia

### Performance

El impacto en performance es **mínimo**:
- Los bloques try-catch solo se ejecutan cuando hay errores (caso excepcional)
- La verificación de `error.code` es instantánea
- Los constraints UNIQUE de PostgreSQL están indexados y son muy eficientes

---

**Fecha de implementación**: Enero 2025
**Versión**: 1.0
**Estado**: ✅ Completado y verificado
