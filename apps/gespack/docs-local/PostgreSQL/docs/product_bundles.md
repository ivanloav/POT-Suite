# product_bundles (Productos en Bundles)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con otras Tablas](#relación-con-otras-tablas)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones](#ejemplo-de-inserciones)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

#### 1. General:

* Tabla `product_bundles` para definir la composición de bundles/lotes de productos por cliente (`site_id`).
* Incluye campos de auditoría, estado y SKUs auxiliares.

#### 2. Tipos de Datos:

* `int` → `BIGINT` / `INT`
* `nvarchar` → `TEXT`
* `boolean` → `BOOLEAN`
* `timestamp` → `TIMESTAMP`

#### 3. Claves e Integridad:

* Clave primaria: `bundle_item_id`
* Clave única: `(site_id, bundle_id)`
* Foreign Key: `(site_id, product_id)` → `products`

---

### Detalle de Transformaciones por Campo

| Campo original   | Campo nuevo      | Tipo PostgreSQL | Comentario                          |
| ---------------- | ---------------- | --------------- | ----------------------------------- |
| ID_BUNDLE_ITEM   | bundle_item_id   | BIGINT          | Clave primaria autonumérica         |
| SITE_ID          | site_id          | BIGINT          | Cliente (sitio)                     |
| ID_BUNDLE        | bundle_id        | INT             | Identificador del bundle            |
| PRODUCTO_ID      | product_id       | BIGINT          | Clave foránea a products            |
| SKU_BUNDLE       | sku_bundle       | TEXT            | SKU identificador bundle            |
| SKU_WMS          | sku_wms          | TEXT            | SKU para WMS                        |
| QTY              | qty              | INT             | Cantidad de producto en el bundle   |
| DATE_CREATION    | date_creation    | TIMESTAMP       | Fecha de creación técnica/histórica |
| CREATED_BY       | created_by       | TEXT            | Usuario que crea el registro        |
| CREATED_AT       | created_at       | TIMESTAMP       | Fecha de creación (trazabilidad)    |
| MODIF_BY         | modified_by      | TEXT            | Usuario que modifica el registro    |
| updated_at      | updated_at      | TIMESTAMP       | Fecha de modificación               |
| IS_ACTIVE        | is_active        | BOOLEAN         | ¿Bundle activo?                     |

---

### Relación con otras Tablas

* `products`: Foreign key `(site_id, product_id)`
* `bundles`: relación conceptual por `bundle_id`
* Multi-sitio por `site_id`

---

### Flujo General

Cada registro define un producto dentro de un bundle concreto, permitiendo control de stock, histórico y activación/desactivación.

---

### Ejemplo de Inserciones

```sql
INSERT INTO product_bundles (site_id, bundle_id, product_id, sku_bundle, qty, created_by)
VALUES (1, 100, 1001, 'BUNDLE-001', 2, 'admin');
```

---

### Índices recomendados

```sql
DROP INDEX IF EXISTS idx_bundles_sku_bundle CASCADE;
CREATE INDEX idx_bundles_sku_bundle ON product_bundles (sku_bundle);

DROP INDEX IF EXISTS idx_bundles_sku_wms CASCADE;
CREATE INDEX idx_bundles_sku_wms ON product_bundles (sku_wms);
```
