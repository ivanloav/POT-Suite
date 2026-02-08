# Products (Productos)

## Índice
- [Cambios realizados desde `Productos` a `products`](#cambios-realizados-desde-productos-a-products)
- [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
- [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares)
- [Índices](#índices)
- [Ejemplo de Inserciones y Consultas](#ejemplo-de-inserciones-y-consultas)

### Cambios realizados desde `Productos` a `products`

#### 1. General:
   - Cambiado el nombre de la tabla de `Productos` a `products` para estandarizar en inglés y en `snake_case`.
   - Los campos fueron traducidos y adaptados a PostgreSQL.
   - Los identificadores se ajustaron para incluir el campo `site_id` en un entorno multi-cliente.

#### 2. Tipos de Datos:
   - Los tipos de datos fueron adaptados a PostgreSQL:
      - `nvarchar` → `TEXT`
      - `decimal` → `NUMERIC(10, 3)`
      - `money` → `NUMERIC(19, 4)`
      - `datetime` → `TIMESTAMP`
      - `tinyint` → `SMALLINT`
      - `bit` → `BOOLEAN`

#### 3. Claves Primarias y Secundarias:
   - Clave primaria compuesta por `site_id` y `product_id` para soportar un entorno multi-cliente.
   - `product_id` definido como un campo autogenerado (`GENERATED ALWAYS AS IDENTITY`).

---

### Detalle de Transformaciones por Campo

#### Campos de `Productos` → `products`:
   - `ID` → `product_id BIGINT GENERATED ALWAYS AS IDENTITY` (Identificador único del producto).
   - `REFERENCIA` → `reference TEXT NOT NULL` (Referencia del producto).
   - `CATALOGO` → `catalog TEXT` (Código del catálogo).
   - `ACCION` → `action TEXT` (Acción asociada).
   - `DESCRIPCION` → `description TEXT` (Descripción del producto).
   - `PESO` → `weight NUMERIC(10, 3)` (Peso del producto).
   - `IVA` → `vat NUMERIC(10, 3)` (Impuesto aplicado).
   - `UBICACION_PICKING` → `picking_location TEXT` (Ubicación de picking).
   - `UBICACION_ALMACEN` → `storage_location TEXT` (Ubicación en almacén).
   - `EMBALAJE` → `packaging SMALLINT` (Tipo de embalaje).
   - `PRECIO` → `price NUMERIC(19, 4)` (Precio del producto).
   - `UNIDADES_PACK` → `units_per_pack INT` (Unidades por pack).
   - `STOCK` → `stock INT` (Cantidad en stock).
   - `COSTE` → `cost NUMERIC(19, 4)` (Coste del producto).
   - `INF_ADICIONAL` → `additional_info TEXT` (Información adicional).
   - `TIPO_IVA` → `vat_type SMALLINT` (Tipo de IVA).
   - `FECHA_ALTA` → `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (Fecha de alta del producto).
   - `ESTADO` → `status TEXT` (Estado del producto).
   - `STOCKBLOQUEADO` → `blocked_stock SMALLINT` (Cantidad de stock bloqueado).
   - `PESADO` → `is_shipped_by_supplier BOOLEAN NOT NULL DEFAULT FALSE` (Producto pesado).
   - `CREADOR` → `created_by TEXT` (Usuario que creó el producto).
   - `MODIFICADOR` → `updated_by TEXT` (Usuario que modificó el producto).
   - `FECHA_MODIFICACION` → `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` (Fecha de última modificación).

---

#### Campos Eliminados:
   - Ningún campo fue eliminado; todos los datos relevantes fueron trasladados o transformados.

#### Campos Nuevos:
   - `site_id` → Añadido para diferenciar productos por sitio.
   - `created_at` → Fecha de creación con valor predeterminado `CURRENT_TIMESTAMP`.
   - `updated_at` → Fecha de última modificación con valor predeterminado `CURRENT_TIMESTAMP`.
   - `created_by` → Usuario que creó el producto.
   - `updated_by` → Usuario que modificó el producto.

---

### Relación con Tablas Auxiliares

- Relación implícita con `sites` a través del campo `site_id`, utilizado para diferenciar productos por cliente o sitio.

---

### Índices

- `idx_products_reference`: Índice para la columna `reference`.

```sql
CREATE INDEX idx_products_reference ON products (reference);
```

---

### Ejemplo de Inserciones y Consultas

#### 1. Insertar un Producto
```sql
INSERT INTO products (site_id, reference, catalog, action, description, weight, vat, picking_location, storage_location, packaging, price, units_per_pack, stock, cost, additional_info, vat_type, created_by, created_at, updated_by, updated_at, status, blocked_stock, is_shipped_by_supplier)
VALUES (1, 'REF123', 'CAT123', 'ACT123', 'Descripción del producto', 1.23, 21.00, 'Ubicación A', 'Almacén B', 1, 100.00, 10, 50, 75.00, 'Información adicional', 2, 'Admin', CURRENT_TIMESTAMP, 'Admin', CURRENT_TIMESTAMP, 'Activo', 5, FALSE);
```

#### 2. Consultar Productos por Referencia
```sql
SELECT * FROM products WHERE reference = 'REF123';
```

#### 3. Contar Productos por Sitio
```sql
SELECT site_id, COUNT(*) AS total_products FROM products GROUP BY site_id;
```

