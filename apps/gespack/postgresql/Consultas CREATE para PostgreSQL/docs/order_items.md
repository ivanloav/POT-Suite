# order_items (Líneas de Pedido)

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

* Tabla `order_items` actualizada para reflejar de forma precisa las líneas de cada pedido.
* Uso completo de `site_id` como discriminador multi-tenant.

#### 2. Tipos de Datos:

* `int` → `BIGINT` / `INT`
* `money` → `NUMERIC(19, 4)`
* `nvarchar` → `TEXT`

#### 3. Claves e Integridad:

* Clave primaria: `order_item_id`
* Clave foránea compuesta: `(site_id, order_id)` → `orders`
* Unicidad reforzada por `site_id`, `order_id`, `line_number`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo           | Tipo PostgreSQL | Comentario                             |
| ------------------- | --------------------- | --------------- | -------------------------------------- |
| ID                  | order_item_id         | BIGINT          | Clave primaria autonumérica            |
| ID_SITE             | site_id               | BIGINT          | Cliente (sitio) asociado               |
| ID_PEDIDO           | order_id              | BIGINT          | Pedido asociado                        |
| NUM_LINEA           | line_number           | INT             | Número de línea del pedido             |
| ID_REF              | product_ref           | TEXT            | Referencia del producto                |
| REF_ART             | catalog_ref           | TEXT            | Referencia del artículo en el catálogo |
| CATALOGO            | catalog_code          | TEXT            | Código del catálogo                    |
| CANTIDAD            | quantity              | INT             | Cantidad solicitada                    |
| ARTICULO            | product_description   | TEXT            | Descripción del producto               |
| PRECIO              | unit_price            | NUMERIC(19, 4)  | Precio unitario                        |
| IMP                 | line_total            | NUMERIC(19, 4)  | Importe total de la línea              |
| ABONADO             | is_refunded           | BOOLEAN         | Estado de abono                        |
| RESERVASTOCK        | is_stock_reserved     | BOOLEAN         | ¿Stock reservado?                      |
| IS_SUSTITUTIVO      | is_substitute         | BOOLEAN         | ¿Es sustitutivo?                       |
| IS_SIN_ARTICULO     | is_unavailable        | BOOLEAN         | ¿Sin artículo?                         |
| FRASE_DISCULPA      | apology_phrase        | TEXT            | Frase de disculpa                      |
| IS_PESADO           | is_supplier_shipped   | BOOLEAN         | ¿Envío del proveedor?                  |
| CREADOR             | created_by            | TEXT            | Usuario que creó el registro           |
| FECHA_CREACION      | created_at            | TIMESTAMP       | Fecha de creación                      |
| MODIFICADOR         | modified_by           | TEXT            | Usuario que modificó el registro       |
| FECHA_MODIFICACION  | updated_at           | TIMESTAMP       | Fecha de modificación                  |

---

### Relación con otras Tablas

* `orders`: clave foránea compuesta `(site_id, order_id)` con `ON DELETE CASCADE`
* `order_item_substitutes`: relación secundaria con líneas de sustitución

---

### Flujo General

Cada línea representa un artículo dentro de un pedido. Se controla la unicidad por número de línea y pedido. Se incluyen flags booleanos como abonado, sin artículo, sustitutivo o enviado por proveedor.

---

### Ejemplo de Inserciones

```sql
INSERT INTO order_items (site_id, order_id, line_number, product_ref, quantity, unit_price)
VALUES (1, 1001, 1, 'PRD001', 2, 19.95);
```

---

### Índices recomendados

```sql
CREATE INDEX idx_order_items_order_id ON order_items (site_id, order_id);
CREATE INDEX idx_order_items_site_line ON order_items (site_id, order_id, line_number);
CREATE INDEX idx_order_items_site_product ON order_items (site_id, product_ref);
```
