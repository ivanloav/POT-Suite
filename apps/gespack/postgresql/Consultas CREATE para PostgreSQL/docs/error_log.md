# error\_log (Histórico de Errores y Eventos)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con otras Tablas](#relación-con-otras-tablas)
* [Función de la tabla](#función-de-la-tabla)
* [Ejemplo de Inserción](#ejemplo-de-inserción)
* [Índices recomendados](#índices-recomendados)
* [Apéndice](#-apéndice-uso-de-enum-en-postgresql-error_severity)

---

### Cambios realizados

* Añadido campo `site_id` multi-tenant y FK a `sites`.
* Severidad del error gestionada mediante ENUM (`error_severity`).
* Añadido campo `is_resolved` para indicar si el error/incidencia está solucionado.
* Flags de estado (`is_saved`, `is_modified`, `is_invoiced`) con default FALSE.
* Auditoría estándar.

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo PostgreSQL | Tipo                 | Comentario                                              |
| ------------------- | ---------------- | -------------------- | ------------------------------------------------------- |
| ID                  | error\_log\_id   | BIGINT               | Clave primaria autonumérica                             |
| (nuevo)             | site\_id         | BIGINT               | Cliente/tenant, multi-tenant                            |
| FECHA               | event\_date      | TIMESTAMP            | Fecha/hora del evento/error (default actual)            |
| PEDIDO              | order\_reference | TEXT                 | Código pedido (siempre combinado con site\_id en joins) |
| DESCRIPCION         | description      | TEXT                 | Descripción del error/incidencia                        |
| SECCION             | section          | TEXT                 | Módulo/sección de la aplicación                         |
| USUARIO             | user\_name       | TEXT                 | Usuario implicado                                       |
| GRAVEDAD            | severity         | ENUM (ver apéndice)  | Gravedad: info, warning, error, critical                |
| GRABADO             | is\_saved        | BOOLEAN              | Marcado como grabado                                    |
| MODIFICADO          | is\_modified     | BOOLEAN              | Marcado como modificado                                 |
| FACTURADO           | is\_invoiced     | BOOLEAN              | Marcado como facturado                                  |
| SOLUCIONADO         | is\_resolved     | BOOLEAN              | TRUE si el error está solucionado                       |
| CREADOR             | created\_by      | TEXT                 | Usuario que registra                                    |
| FECHA\_CREACION     | created\_at      | TIMESTAMP            | Fecha de creación                                       |
| MODIFICADOR         | modified\_by     | TEXT                 | Usuario que modifica                                    |
| FECHA\_MODIFICACION | modified\_at     | TIMESTAMP            | Fecha de modificación                                   |

---

### Relación con otras Tablas

* `site_id` → `sites(site_id)` (ON DELETE RESTRICT)
* **IMPORTANTE:** `order_reference` debe utilizarse siempre junto a `site_id` en consultas y relaciones, pues no es clave única ni tiene FK directa a `orders`.

---

### Función de la tabla

Almacena todos los errores, eventos o incidencias producidos en la aplicación, asociados a cliente, pedido y usuario. Permite filtrar por gravedad, estado de resolución y origen, y consultar rápidamente el histórico para análisis, soporte y debugging.
El campo `order_reference` sólo es único en combinación con `site_id` y su integridad debe gestionarse a nivel de aplicación.

---

### Ejemplo de Inserción

```sql
-- Crear tipo ENUM si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'error_severity') THEN
    CREATE TYPE error_severity AS ENUM ('info', 'warning', 'error', 'critical');
  END IF;
END$$;

-- Ejemplo de inserción
INSERT INTO error_log (site_id, event_date, order_reference, description, section, user_name, severity, is_saved, is_modified, is_invoiced, is_resolved, created_by)
VALUES (1, CURRENT_TIMESTAMP, 'PED123', 'Error al grabar pedido', 'Pedidos', 'jlopez', 'critical', TRUE, FALSE, FALSE, FALSE, 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_error_log_site_order ON error_log (site_id, order_reference);
CREATE INDEX idx_error_log_site_section ON error_log (site_id, section);
CREATE INDEX idx_error_log_site_severity ON error_log (site_id, severity);
CREATE INDEX idx_error_log_site_resolved ON error_log (site_id, is_resolved);
```

---

## 📚 Apéndice: Uso de ENUM en PostgreSQL (`error_severity`)

### ¿Qué es ENUM?

Un `ENUM` en PostgreSQL es un **tipo de dato personalizado** que solo permite unos valores concretos y predefinidos.
Por ejemplo, el tipo `error_severity` solo admite: `'info'`, `'warning'`, `'error'`, `'critical'`.

### ¿Por qué usar ENUM?

* **Evita errores:** Solo permite esos valores, no puedes poner otro por accidente.
* **Autocompletado:** En PgAdmin/DBeaver el campo muestra un desplegable automático.
* **Más claro:** Facilita filtros y reporting (los valores son constantes y homogéneos).

### ¿Cómo se crea el ENUM?

El tipo se crea con este bloque (solo una vez en tu base de datos):

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'error_severity') THEN
    CREATE TYPE error_severity AS ENUM ('info', 'warning', 'error', 'critical');
  END IF;
END$$;
```

### ¿Cómo se usa en una tabla?

```sql
severity error_severity DEFAULT 'error',
```

Esto fuerza a que solo acepte los valores definidos.
**Si intentas insertar otro valor, da error.**

### ¿Cómo cambiar/añadir valores al ENUM en el futuro?

Si necesitas añadir un nuevo valor (por ejemplo, `'debug'`), usa:

```sql
ALTER TYPE error_severity ADD VALUE 'debug';
```

**¡Ojo! No puedes eliminar ni cambiar un valor directamente (solo añadir nuevos).**

### ¿Cómo ver los valores definidos en un ENUM?

```sql
SELECT unnest(enum_range(NULL::error_severity));
```

### ¿Cómo cambiar el valor por defecto?

```sql
ALTER TABLE error_log ALTER COLUMN severity SET DEFAULT 'warning';
```

### **RESUMEN**

* El ENUM se define UNA VEZ y luego se puede usar en tantas tablas/columnas como quieras.
* Es una forma elegante y robusta de forzar valores válidos y homogéneos.
* Si olvidas cómo usarlo, puedes copiar estos comandos y adaptarlos fácilmente.
