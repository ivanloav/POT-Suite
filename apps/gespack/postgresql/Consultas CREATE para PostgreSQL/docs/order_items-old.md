# Order items (Líneas de pedido)

## Índice
- [Cambios realizados desde `Lineas_de_pedido` a `order_items`](#cambios-realizados-desde-lineas_de_pedido-a-order_items)
- [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
- [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares)
- [Flujo General](#flujo-general)
- [Ejemplo de Inserciones y Consultas](#ejemplo-de-inserciones-y-consultas)

### Cambios realizados desde `Lineas_de_pedido` a `order_items`:

#### 1. General:
   - Cambiado el nombre de la tabla de `Lineas_de_pedido` a `order_items` para estandarizar en inglés y en `snake_case`.
   - Los campos fueron traducidos y adaptados a PostgreSQL.
   - Los identificadores se ajustaron para incluir el campo `site_id` en un entorno multi-cliente.

#### 2. Tipos de Datos:
   - Los tipos de datos fueron adaptados a PostgreSQL:
      - `nvarchar` → `TEXT`
      - `int` → `BIGINT` o `INT`
      - `money` → `NUMERIC(19, 4)`
      - `bit` → `BOOLEAN`

#### 3. Claves Primarias y Secundarias:
   - Clave primaria compuesta por `site_id` y `order_item_id` para soportar un entorno multi-cliente.
   - Relación con la tabla `Orders` a través de los campos `site_id` y `order_id`.

---

### Detalle de Transformaciones por Campo

#### Campos de `Lineas_de_pedido` → `order_items`:
   - `ID` → `order_item_id BIGINT GENERATED ALWAYS AS IDENTITY` (Identificador único para la línea del pedido).
   - `PEDIDO` → `order_id BIGINT` (Clave foránea que referencia al pedido en `Orders`).
   - `Linea` → `line_number INT` (Número de línea en el pedido).
   - `ID_REF` → `product_ref TEXT` (Referencia al producto).
   - `REF_ART` → `catalog_ref TEXT` (Referencia en el catálogo).
   - `CATALOGO` → `catalog_code TEXT` (Código del catálogo).
   - `Cantidad` → `quantity INT` (Cantidad del artículo).
   - `Articulo` → `product_description TEXT` (Descripción del artículo).
   - `Precio` → `unit_price NUMERIC(19, 4)` (Precio unitario del artículo).
   - `IMP` → `line_total NUMERIC(19, 4)` (Importe total de la línea).
   - `ABONADO` → `is_abonado TEXT` (Estado de abonado).
   - `RESERVASTOCK` → `stock_reserved BOOLEAN DEFAULT FALSE` (Indica si el stock está reservado).
   - `IS_SUSTITUTIVO` → `is_substitute BOOLEAN DEFAULT FALSE` (Indica si es un producto sustitutivo).
   - `IS_SIN_ARTICULO` → `is_unavailable BOOLEAN DEFAULT FALSE` (Indica si el artículo no está disponible).
   - `FRASE_DISCULPA` → `apology_phrase TEXT` (Frase de disculpa asociada).
   - `IS_PESADO` → `is_supplier_shipped BOOLEAN DEFAULT FALSE` (Indica si el producto es enviado por un proveedor).

#### Campos Eliminados:
   - Ningún campo fue eliminado; todos los datos relevantes fueron trasladados o transformados.

#### Campos Nuevos:
   - `site_id BIGINT` → Asociado al cliente o sitio del pedido.
   - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → Fecha de creación de la línea del pedido.
   - `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → Fecha de última actualización de la línea del pedido.

---

### Relación con Tablas Auxiliares

#### 1. Relación con `Orders`:
   - **Propósito**:
     - Asociar cada línea de pedido con su pedido correspondiente en `Orders`.
   - **Campos**:
     - `order_id` y `site_id`: Relación con la clave primaria compuesta en `Orders`.
   - **Restricción**:
     - Clave foránea con opción de eliminación en cascada (`ON DELETE CASCADE`).

#### 2. Relación con `order_item_substitutes`:
   - **Propósito**:
     - Almacenar información sobre productos sustitutivos para las líneas de pedido.
   - **Campos**:
     - `order_item_id` y `site_id`: Relación con la clave primaria compuesta en `order_items`.
   - **Restricción**:
     - Clave foránea con opción de eliminación en cascada (`ON DELETE CASCADE`).

---

### Flujo General

1. **Definición de Líneas de Pedido**:
   - Las líneas de pedido (`order_items`) se definen con detalles generales y se relacionan con pedidos.

2. **Creación de Productos Sustitutivos**:
   - Cada producto sustitutivo en `order_item_substitutes` se relaciona con una línea de pedido y se describe con detalles generales.

3. **Relación con Pedidos**:
   - Las líneas de pedido se asocian a pedidos en `Orders` mediante `order_id` y `site_id`.

### Ejemplo de Inserciones y Consultas

#### 1. Insertar una Línea de Pedido
```sql
INSERT INTO order_items (site_id, order_id, line_number, product_ref, quantity, unit_price, line_total)
VALUES 
(1, 1001, 1, 'PROD123', 2, 50.00, 100.00);
```

#### 2. Consultar Líneas de Pedido para un Pedido
```sql
SELECT oi.line_number, oi.product_ref, oi.quantity, oi.unit_price, oi.line_total
FROM order_items oi
WHERE oi.site_id = 1 AND oi.order_id = 1001;
```

#### 3. Consultar Líneas Sustitutivas
```sql
SELECT oi.line_number, oi.substitute_product_ref, oi.substitute_quantity, oi.substitute_import
FROM order_items oi
WHERE oi.site_id = 1 AND oi.is_substitute = TRUE;
```

#### 4. Consultar Productos Enviados por Proveedor
```sql
SELECT oi.line_number, oi.product_ref, oi.quantity, oi.unit_price
FROM order_items oi
WHERE oi.site_id = 1 AND oi.is_supplier_shipped = TRUE;
```

#### 5. Consultar Productos Sustitutivos para una Línea de Pedido
```sql
SELECT os.substitute_product_ref, os.substitute_quantity, os.substitute_import
FROM order_item_substitutes os
WHERE os.site_id = 1 AND os.order_item_id = 1;
```