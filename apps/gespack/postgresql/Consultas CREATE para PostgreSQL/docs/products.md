# products (Productos)

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

* Tabla `products` para almacenar la información principal de cada producto.
* Uso de `site_id` para multicliente.
* Control y referencia de catálogo, acción, ubicaciones, precios, unidades, bloqueos, etc.

#### 2. Tipos de Datos:

* `int` → `BIGINT` / `SMALLINT`
* `money` → `NUMERIC(19,4)`
* `nvarchar` → `TEXT`
* `decimal` → `NUMERIC(10,3)`
* `boolean` → `BOOLEAN`

#### 3. Claves e Integridad:

* Clave primaria: `product_id`
* UNIQUE (site_id, product_ref)
* Foreign Key: `(site_id, brand_id)` → `brands(site_id, brand_id)`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo               | Tipo PostgreSQL | Comentario                        |
| ------------------- | ------------------------- | --------------- | --------------------------------- |
| ID_PRODUCTO         | product_id                | BIGINT          | Clave primaria autonumérica       |
| ID_SITE             | site_id                   | BIGINT          | Identificador del sitio           |
| REFERENCIA          | product_ref               | TEXT            | Referencia del producto           |
| CATALOGO            | catalog                   | TEXT            | Código del catálogo               |
| MARCA               | brand_id                  | BIGINT          | Marca asociada                    |
| ACCION              | action                    | TEXT            | Acción asociada                   |
| DESCRIPCION         | description               | TEXT            | Descripción del producto          |
| PESO                | weight                    | NUMERIC(10,3)   | Peso del producto                 |
| IVA                 | vat                       | NUMERIC(10,3)   | IVA aplicado                      |
| UBICACION_PICKING   | picking_location          | TEXT            | Ubicación de picking              |
| UBICACION_ALMACEN   | storage_location          | TEXT            | Ubicación en almacén              |
| EMBALAJE            | packaging                 | SMALLINT        | Tipo de embalaje                  |
| PRECIO              | price                     | NUMERIC(19,4)   | Precio del producto               |
| UNIDADES_PACK       | units_per_pack            | INT             | Unidades por pack                 |
| STOCK               | stock                     | INT             | Cantidad en stock                 |
| COSTE               | cost                      | NUMERIC(19,4)   | Coste del producto                |
| INF_ADICIONAL       | additional_info           | TEXT            | Información adicional             |
| TIPO_IVA            | vat_type                  | SMALLINT        | Tipo de IVA                       |
| ESTADO              | status                    | TEXT            | Estado del producto               |
| STOCKBLOQUEADO      | blocked_stock             | SMALLINT        | Cantidad de stock bloqueado       |
| PESADO              | is_shipped_by_supplier    | BOOLEAN         | Producto pesado                   |
| CREADOR             | created_by                | TEXT            | Usuario que crea el producto      |
| FECHA_CREACION      | created_at                | TIMESTAMP       | Fecha de creación                 |
| MODIFICADOR         | modified_by               | TEXT            | Usuario que modifica              |
| FECHA_MODIFICACION  | updated_at               | TIMESTAMP       | Fecha de modificación             |

---

### Relación con otras Tablas

* `brands`: clave foránea `(site_id, brand_id)`
* `packaging`: relación por campo `packaging`
* `sites`: relación por campo `site_id`

---

### Flujo General

Cada registro representa un producto concreto y único dentro del sitio correspondiente.
La tabla centraliza información de catálogo, ubicación logística, atributos comerciales y bloqueos de stock.

---

### Ejemplo de Inserciones

```sql
INSERT INTO products (site_id, product_ref, catalog, description, price, stock, created_by)
VALUES (1, 'PRD-001', 'CAT2025', 'Camiseta básica azul', 12.50, 50, 'admin');
```

---

### Índices recomendados

```sql
CREATE UNIQUE INDEX idx_products_site_product_ref ON products (site_id, product_ref);
```
