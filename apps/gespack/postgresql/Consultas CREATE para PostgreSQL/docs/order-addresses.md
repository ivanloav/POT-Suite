# order_addresses (Direcciones del Pedido)

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

* Tabla `order_addresses` creada para almacenar direcciones de facturación y envío asociadas a cada pedido.
* Clave foránea compuesta: `(site_id, order_id)`.

#### 2. Tipos de Datos:

* `nvarchar` → `TEXT`
* `int` → `BIGINT`

#### 3. Claves e Integridad:

* Clave primaria: `address_id`
* Foreign Key: `(site_id, order_id)` → `orders`

---

### Detalle de Transformaciones por Campo

| Campo original | Campo nuevo              | Tipo PostgreSQL | Comentario                       |
| -------------- | ------------------------ | --------------- | -------------------------------- |
| ID_DIRECCION   | address_id               | BIGINT          | Clave primaria autonumérica      |
| ID_PEDIDO      | order_id                 | BIGINT          | Pedido asociado                  |
| ID_SITE        | site_id                  | INT             | Cliente (sitio)                  |
| REF_PEDIDO     | order_reference          | TEXT            | Referencia del pedido            |
| BILL_NOMBRE    | billing_customer_name    | TEXT            | Nombre del cliente (facturación) |
| BILL_DIR1      | billing_address_line1    | TEXT            | Dirección línea 1 (facturación)  |
| BILL_DIR2      | billing_address_line2    | TEXT            | Dirección línea 2 (facturación)  |
| BILL_DIR3      | billing_address_line3    | TEXT            | Dirección línea 3 (facturación)  |
| BILL_DIR4      | billing_address_line4    | TEXT            | Dirección línea 4 (facturación)  |
| BILL_DIR5      | billing_address_line5    | TEXT            | Dirección línea 5 (facturación)  |
| BILL_CP        | billing_postal_code      | TEXT            | Código postal (facturación)      |
| BILL_CIUDAD    | billing_city             | TEXT            | Ciudad (facturación)             |
| BILL_TEL       | billing_mobile_phone     | TEXT            | Teléfono móvil (facturación)     |
| SHIP_NOMBRE    | shipping_customer_name   | TEXT            | Nombre del cliente (envío)       |
| SHIP_DIR1      | shipping_address_line1   | TEXT            | Dirección línea 1 (envío)        |
| SHIP_DIR2      | shipping_address_line2   | TEXT            | Dirección línea 2 (envío)        |
| SHIP_DIR3      | shipping_address_line3   | TEXT            | Dirección línea 3 (envío)        |
| SHIP_DIR4      | shipping_address_line4   | TEXT            | Dirección línea 4 (envío)        |
| SHIP_DIR5      | shipping_address_line5   | TEXT            | Dirección línea 5 (envío)        |
| SHIP_CP        | shipping_postal_code     | TEXT            | Código postal (envío)            |
| SHIP_CIUDAD    | shipping_city            | TEXT            | Ciudad (envío)                   |

---

### Relación con otras Tablas

* `orders`: clave foránea compuesta `(site_id, order_id)` con `ON DELETE RESTRICT`

---

### Flujo General

La tabla almacena información completa de facturación y envío de cada pedido, replicando los campos clásicos de dirección en 5 líneas, código postal, ciudad y nombre del destinatario.

---

### Ejemplo de Inserciones

```sql
INSERT INTO order_addresses (site_id, order_id, order_reference, billing_customer_name, billing_address_line1, billing_postal_code)
VALUES (1, 101, 'PO-001', 'Juan Pérez', 'Calle Mayor 1', '28001');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_order_addresses_order_id ON order_addresses (site_id, order_id);
CREATE INDEX idx_order_addresses_order_reference ON order_addresses (site_id, order_reference);
```
