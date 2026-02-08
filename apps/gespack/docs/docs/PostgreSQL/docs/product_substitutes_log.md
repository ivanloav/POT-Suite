# product_substitutes_log (Log de Sustituciones de Productos)

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

* Tabla `product_substitutes_log` para trazar cada sustitución efectuada en pedidos, bundles o líneas.
* Multicliente por `site_id`.
* Registra datos originales y de sustitución (SKU, cantidades, precios...).

#### 2. Tipos de Datos:

* `int` → `BIGINT` / `INT`
* `boolean` → `BOOLEAN`
* `varchar`/`nvarchar` → `TEXT` / `VARCHAR`
* `numeric` → `NUMERIC(10,2)`
* `timestamp` → `TIMESTAMP`

#### 3. Claves e Integridad:

* Clave primaria: `log_id`
* UNIQUE (site_id, substitute_id)
* Foreign Key: `(site_id, substitute_id)` → `product_substitutes`

---

### Detalle de Transformaciones por Campo

| Campo original  | Campo nuevo             | Tipo PostgreSQL | Comentario                                 |
| --------------- | ----------------------- | --------------- | ------------------------------------------ |
| LOG_ID          | log_id                  | BIGINT          | Clave primaria autonumérica                |
| SITE_ID         | site_id                 | BIGINT          | ID del sitio                               |
| SUBSTITUTE_ID   | substitute_id           | BIGINT          | ID sustitución (FK a product_substitutes)  |
| PEDIDO          | order_id                | VARCHAR(50)     | Pedido asociado                            |
| IS_BUNDLE       | is_bundle               | BOOLEAN         | ¿Pertenece a un bundle?                    |
| ID_BUNDLE       | bundle_id               | VARCHAR(50)     | ID del bundle                              |
| SKU_BUNDLE      | sku_bundle              | VARCHAR(50)     | SKU del bundle                             |
| SKU_WMS         | sku_wms                 | VARCHAR(50)     | SKU WMS original                           |
| QTY             | quantity                | INT             | Cantidad original                          |
| LINEA_PEDIDO    | order_line              | VARCHAR(50)     | Línea de pedido                            |
| DESCRIPCION     | description             | TEXT            | Descripción original                       |
| PRECIO          | price                   | NUMERIC(10,2)   | Precio original                            |
| IMP             | total                   | NUMERIC(10,2)   | Importe original                           |
| SKU_WMS_SUST    | sku_wms_substitute      | VARCHAR(50)     | SKU WMS sustituto                          |
| QTY_SUST        | quantity_substitute     | INT             | Cantidad sustituida                        |
| DESC_SUST       | description_substitute  | TEXT            | Descripción del sustituto                  |
| PRECIO_SUST     | price_substitute        | NUMERIC(10,2)   | Precio del sustituto                       |
| IMP_SUST        | total_substitute        | NUMERIC(10,2)   | Importe del sustituto                      |
| FRASE_DISCULPA  | apology_phrase          | TEXT            | Frase de disculpa                          |
| DATE_CREATION   | created_at              | TIMESTAMP       | Fecha de registro                          |
| CREATED_BY      | created_by              | TEXT            | Usuario que realiza el registro            |

---

### Relación con otras Tablas

* `product_substitutes`: clave foránea `(site_id, substitute_id)`

---

### Flujo General

Registra, audita y deja traza de todas las sustituciones reales efectuadas en los pedidos, con datos de la línea original y la sustituida.

---

### Ejemplo de Inserciones

```sql
INSERT INTO product_substitutes_log (site_id, substitute_id, order_id, quantity, order_line, created_by)
VALUES (1, 2001, 'PO-100', 3, 'L2', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_product_substitutes_log_site_id ON product_substitutes_log (site_id, substitute_id);
```
