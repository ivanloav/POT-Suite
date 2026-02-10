# Control de Concurrencia en IT Inventory

## 🔒 Estrategias Implementadas

### 1. **Constraints UNIQUE en Base de Datos**

Previene duplicados a nivel de BD, garantizado por PostgreSQL:

#### Assets
- `CONSTRAINT ux_assets_site_tag UNIQUE (site_id, asset_tag)` ✅
- `CONSTRAINT ux_assets_site_serial UNIQUE (site_id, serial)` ✅
- `CONSTRAINT ux_assets_site_imei UNIQUE (site_id, imei)` ✅

#### Employees
- `CONSTRAINT ux_employees_site_email UNIQUE (site_id, email)` ✅
- `CONSTRAINT ux_employees_site_fullname UNIQUE (site_id, first_name, last_name, second_last_name)` ✅

#### Usuarios
- `email CITEXT NOT NULL UNIQUE` ✅

#### Catálogos
- `code` es UNIQUE en: roles, permissions, asset_types, asset_statuses, etc. ✅

**Resultado:** Si dos usuarios intentan crear el mismo registro simultáneamente, PostgreSQL rechaza el segundo con error de constraint violation.

---

### 2. **Transacciones Automáticas (TypeORM)**

- Cada operación de create/update está dentro de una transacción implícita
- PostgreSQL garantiza ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad)
- Nivel de aislamiento por defecto: `READ COMMITTED`

**Ejemplo:**
```typescript
// Si dos usuarios ejecutan esto al mismo tiempo:
await this.repository.save(entity);

// PostgreSQL garantiza:
// - Solo uno guarda exitosamente
// - El otro recibe error de constraint si hay violación
// - Rollback automático en caso de error
```

---

### 3. **Timestamps de Auditoría**

Cada entidad tiene:
- `created_at` - Fecha de creación
- `updated_at` - Última modificación (actualizado automáticamente por trigger)
- `created_by` - Usuario creador
- `updated_by` - Usuario que modificó

**Uso:** Detección de conflictos de edición optimista (future enhancement)

---

### 4. **Validaciones en Backend (NestJS)**

Antes de guardar, los servicios verifican:

```typescript
// Ejemplo: roles-admin.service.ts
const existingRole = await this.roleRepository.findOne({
  where: { code: createRoleDto.code },
});

if (existingRole) {
  throw new ConflictException('El código de rol ya existe');
}
```

**Problema:** Race condition entre el check y el save.

**Solución:** El constraint UNIQUE en BD es la defensa final.

---

## 🚀 Mejoras Futuras (Opcional)

### 1. Optimistic Locking con Versioning

Agregar columna `version` a entidades críticas:

```typescript
@Entity()
export class Asset {
  @VersionColumn()
  version: number;
}
```

TypeORM detecta si otro usuario modificó el registro:
```typescript
// Lanza OptimisticLockVersionMismatchError si cambió
await repo.save(asset); 
```

### 2. Bloqueos Pesimistas (Pessimistic Locking)

Para operaciones críticas:

```typescript
await repo.findOne({
  where: { id },
  lock: { mode: 'pessimistic_write' }
});
```

Bloquea el registro hasta que termine la transacción.

### 3. Notificaciones en Tiempo Real

WebSockets para alertar cambios:
- "Este activo fue modificado por otro usuario"
- Recargar datos automáticamente

---

## ✅ Estado Actual

### Protecciones Activas:
1. ✅ **Constraints UNIQUE** - Previene duplicados
2. ✅ **Transacciones automáticas** - Integridad de datos
3. ✅ **Auditoría completa** - Trazabilidad de cambios
4. ✅ **Validaciones backend** - Primera línea de defensa

### Escenarios Cubiertos:

#### Escenario 1: Dos usuarios crean el mismo empleado
```
Usuario A: Crea "Juan Pérez" → ✅ Éxito
Usuario B: Crea "Juan Pérez" → ❌ Error: "UNIQUE constraint violation"
Frontend muestra: "Ya existe un empleado con ese nombre"
```

#### Escenario 2: Dos usuarios editan el mismo activo
```
Usuario A: Edita asset_tag "LAP-001" → Guarda primero → ✅ Éxito
Usuario B: Edita asset_tag "LAP-001" → Guarda después → ✅ Sobrescribe
(Última escritura gana - no hay conflicto si campos diferentes)
```

#### Escenario 3: Dos usuarios eliminan el mismo registro
```
Usuario A: DELETE FROM assets WHERE id = 5 → ✅ Eliminado
Usuario B: DELETE FROM assets WHERE id = 5 → ⚠️ No encuentra el registro
Backend devuelve: "Asset no encontrado"
```

---

## 🎯 Recomendaciones

Para uso actual (5-20 usuarios concurrentes):
- ✅ **Sistema actual es suficiente**
- Las constraints UNIQUE + transacciones cubren el 99% de casos
- La auditoría permite rastrear cualquier problema

Para escalar (50+ usuarios):
- Considerar optimistic locking con `@VersionColumn()`
- Implementar retry logic en frontend para conflictos
- Monitorear deadlocks con `pg_stat_activity`

---

## 📊 Monitoreo de Conflictos

Query PostgreSQL para ver bloqueos activos:

```sql
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query,
  wait_event_type,
  wait_event
FROM pg_stat_activity
WHERE state = 'active' AND wait_event IS NOT NULL;
```

Ver conflictos de constraints:

```sql
SELECT * FROM pg_stat_database_conflicts WHERE datname = 'it_inventory';
```

---

**Conclusión:** El sistema actual tiene protección robusta contra conflictos básicos de concurrencia. Para casos de uso extremos, las mejoras propuestas pueden implementarse sin cambios mayores en la arquitectura.
