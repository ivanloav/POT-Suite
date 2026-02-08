# order_sources (Fuentes/Canales de Pedido)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones](#ejemplo-de-inserciones)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

#### 1. General:
* Tabla auxiliar normalizada para definir la **fuente** del pedido (source) por sitio: *Web, Phone, Email, POS, Marketplace*, etc.
* Entorno **multi‑tenant** garantizado por `site_id`.
* Nombres en `snake_case`.

#### 2. Tipos de Datos:
* `nvarchar` → `TEXT`
* `datetime` → `TIMESTAMP`
* `int` → `BIGINT` (para PKs técnicas)

#### 3. Claves Primarias:
* `order_source_id` como clave primaria autonumérica.
* `site_id` obligatorio.

---

### Detalle de Transformaciones por Campo

| Campo original | Campo nuevo      | Tipo PostgreSQL | Comentario                                |
| -------------- | ---------------- | --------------- | ----------------------------------------- |
| ID             | order_source_id  | BIGINT          | Clave primaria autonumérica               |
| SITE_ID        | site_id          | BIGINT          | Tenant/cliente al que pertenece           |
| SOURCE_NAME    | source_name      | TEXT            | Nombre de la fuente (único por sitio)     |
| DESCRIPTION    | description      | TEXT            | Descripción opcional                      |
| ACTIVO         | is_active        | BOOLEAN         | Activo/inactivo                           |
| CREADOR        | created_by       | BIGINT          | Usuario que crea el registro              |
| FECHA_CREACION | created_at       | TIMESTAMP       | Fecha de creación                         |
| MODIFICADOR    | modified_by      | BIGINT          | Usuario que modifica                      |
| FECHA_MODIF.   | updated_at      | TIMESTAMP       | Fecha de modificación                     |

---

### Flujo General

Catálogo por `site_id` que lista los canales de entrada del pedido. Otras tablas (por ejemplo, `orders`) referencian este catálogo mediante `order_source_id`.  
Se recomienda usar **FK compuesta** `(site_id, order_source_id)` desde `orders` para reforzar la integridad multi‑tenant.

---

### Ejemplo de Inserciones

```sql
-- Altas de fuentes
INSERT INTO order_sources (site_id, source_name, description, created_by)
VALUES
  (1, 'Web',        'Pedido realizado desde la web',        1001),
  (1, 'Phone',      'Pedido registrado por teléfono',       1001),
  (1, 'Marketplace','Pedido importado de marketplace',      1001);

-- Uso posterior en orders buscando el id:
INSERT INTO orders (
  site_id, order_datetime, order_reference, brand_id, order_source_id,
  customer_id, is_paid, created_by_id, created_by_name
)
SELECT
  1, CURRENT_TIMESTAMP, 'PO-2025-001', 3, os.order_source_id,
  101, FALSE, 1, 'Iván'
FROM order_sources os
WHERE os.site_id = 1 AND lower(os.source_name) = 'web';
```

---

### Índices recomendados

```sql
-- Unicidad por sitio (case‑insensitive sobre nombre)
CREATE UNIQUE INDEX uq_order_sources_site_name_ci
  ON order_sources (site_id, lower(source_name));

-- Para FKs compuestas desde tablas multitenant
ALTER TABLE order_sources
  ADD CONSTRAINT uq_order_sources_site_id_and_id UNIQUE (site_id, order_source_id);

-- Índices de apoyo
CREATE INDEX idx_order_sources_site_id       ON order_sources (site_id);
CREATE INDEX idx_order_sources_is_active     ON order_sources (site_id, is_active);
CREATE INDEX idx_order_sources_updated_at   ON order_sources (site_id, updated_at);

CREATE INDEX idx_orders_site_source ON orders (site_id, order_source_id);
```

---
