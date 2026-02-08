# order_item_substitutes (Sustituciones de Líneas de Pedido)

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

* Tabla `order_item_substitutes` creada para registrar artículos que sustituyen líneas de pedido.
* Referencia directa a `order_items` mediante clave foránea `order_item_id` y `site_id`.

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `money` → `NUMERIC(19, 4)`
* `nvarchar` → `TEXT`

#### 3. Claves e Integridad:

* Clave primaria: `substitute_id`
* Clave foránea: `(site_id, order_item_id)` → `order_items`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo               | Tipo PostgreSQL | Comentario                           |
| ------------------- | ------------------------- | --------------- | ------------------------------------ |
| ID                  | substitute_id             | BIGINT          | Clave primaria autonumérica          |
| ID_SITE             | site_id                   | BIGINT          | Cliente (sitio)                      |
| ID_LINEA_PEDIDO     | order_item_id             | BIGINT          | Línea de pedido asociada             |
| ID_REF_SUST         | substitute_product_ref    | TEXT            | Referencia del producto sustituto    |
| REF_SUST            | substitute_catalog_ref    | TEXT            | Referencia en catálogo del sustituto |
| CATALOGO_SUST       | substitute_catalog_code   | TEXT            | Código de catálogo del sustituto     |
| CANT_SUST           | substitute_quantity       | INT             | Cantidad sustituta                   |
| DESC_SUST           | substitute_description    | TEXT            | Descripción del sustituto            |
| IMP_SUST            | substitute_import         | NUMERIC(19, 4)  | Importe correspondiente al sustituto |
| CREADOR             | created_by                | TEXT            | Usuario que creó el registro         |
| FECHA_CREACION      | created_at                | TIMESTAMP       | Fecha de creación                    |
| MODIFICADOR         | updated_by               | TEXT            | Usuario que modificó el registro     |
| FECHA_MODIFICACION  | updated_at               | TIMESTAMP       | Fecha de modificación                |

---

### Relación con otras Tablas

* `order_items`: clave foránea compuesta `(site_id, order_item_id)` con `ON DELETE CASCADE`

---

### Flujo General

Esta tabla registra qué producto sustituye a otro en una línea de pedido.
Se guarda la referencia sustitutiva, cantidad e importe, además de trazabilidad por usuario y fechas.

---

### Ejemplo de Inserciones

```sql
INSERT INTO order_item_substitutes (site_id, order_item_id, substitute_product_ref, substitute_quantity, substitute_import)
VALUES (1, 1101, 'PRD-SUST-001', 1, 9.99);
```

---

### Índices recomendados

```sql
CREATE INDEX idx_substitutes_order_item ON order_item_substitutes (site_id, order_item_id);
CREATE INDEX idx_substitutes_catalog_ref ON order_item_substitutes (site_id, substitute_catalog_ref);
```
