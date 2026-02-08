# Conversión de Tablas de SQL Server a PostgreSQL

Este documento describe el proceso de conversión de tablas de una base de datos en SQL Server a PostgreSQL. Aquí se detallan los pasos realizados, las diferencias clave entre ambos sistemas y las decisiones tomadas durante la migración.

## Índice
📌 **[Principios Generales de la Base de Datos](#principios-generales-de-la-base-de-datos)**
   - 🔑 [Inclusión del Campo `site_id`](#inclusión-del-campo-site_id)

📦 **[Orders (Pedidos)](#1-orders-pedidos)**
   - 🚀 [Cambios realizados desde `Pedidos` a `Orders`](#cambios-realizados-desde-pedidos-a-orders)
   - 🔍 [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo-orders)
   - 🔗 [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares-orders)
     - 🏠 [orders_addresses (Direcciones de Pedidos)](#orders_addresses-direcciones-de-pedidos)
     - 💳 [orders_payments (Pagos de Pedidos)](#orders_payments-pagos-de-pedidos)
     - 🧾 [orders_payments_card_types (Tipos de Tarjetas de Pago)](#orders_payments_card-types-tipos-de-tarjetas-de-pago)
   - 📊 [Flujo General](#flujo-general-orders)
   - 📝 [Ejemplo de Inserciones y Consultas](#ejemplo-de-inserciones-y-consultas-orders)

🛒 **[Order Items (Líneas de Pedido)](#2-order-items-líneas-de-pedido)**
   - 🚀 [Cambios realizados desde `Lineas_de_pedido` a `order_items`](#cambios-realizados-desde-lineas_de_pedido-a-order_items)
   - 🔍 [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo-order-items)
   - 🔗 [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares-order-items)
   - 📊 [Flujo General](#flujo-general-order-items)
   - 📝 [Ejemplo de Inserciones y Consultas](#ejemplo-de-inserciones-y-consultas-order-items)

🎯 **[Actions (Acciones)](#3-actions-acciones)**
   - 🚀 [Cambios realizados desde `Acciones` a `Actions`](#cambios-realizados-desde-acciones-a-actions)
   - 🔍 [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo-actions)
   - 🔗 [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares-actions)
     - 🗂️ [actions_categories (Categorías de Acciones)](#actions_categories-categorías-de-acciones)
     - ⭐ [actions_priority_types (Tipos de Prioridad)](#actions_priority-types-tipos-de-prioridad)
     - 💰 [actions_category_costs (Costos por Categoría y Prioridad)](#actions_category-costs-costos-por-categoría-y-prioridad)
   - 📊 [Flujo General](#flujo-general-actions)
   - 📝 [Ejemplo de Inserciones y Consultas](#ejemplo-de-inserciones-y-consultas-actions)

👥 **[Customers (Clientes)](#4-customers-clientes)**
   - 🚀 [Cambios realizados desde `Clientes` a `customers`](#cambios-realizados-desde-clientes-a-customers)
   - 🔍 [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo-customers)
   - 🔗 [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares-customers)
     - 🏷️ [customers_rnvp_types (Tipos de RNVP)](#customers_rnvp_types-tipos-de-rnvp)
     - 🏷️ [customers_marked_types (Tipos de Marcado)](#customers_marked_types-tipos-de-marcado)
   - 📊 [Flujo General](#flujo-general-customers)
   - 📝 [Ejemplo de Inserciones y Consultas](#ejemplo-de-inserciones-y-consultas-customers)

---

## Principios Generales de la Base de Datos

### Inclusión del Campo `site_id`
- **¿Qué es `site_id`?**
  - El campo `site_id` identifica de forma única al cliente (sitio) al que pertenece cada registro. Es esencial en un entorno multi-cliente.
  
- **¿Por qué es importante?**
  - Permite que varias empresas o clientes utilicen la misma base de datos sin conflictos, asegurando que todos los datos estén correctamente segregados.
  
- **¿Cómo se utiliza?**
  - **Claves Primarias**: Todas las tablas principales utilizan `site_id` como parte de la clave primaria compuesta.
  - **Claves Foráneas**: Las relaciones entre tablas incluyen `site_id` para garantizar la coherencia y aislamiento de los datos.
  
---

## 1. Orders (Pedidos):

### Cambios realizados desde `Pedidos` a `Orders`:

#### 1. General:
   - Cambiado el nombre de la tabla de `Pedidos` a `Orders`.
   - Todos los nombres de los campos fueron traducidos al inglés y estandarizados a `snake_case`.

#### 2. Tipos de Datos:
   - Los tipos de datos fueron adaptados a PostgreSQL:
      - `int` → `BIGINT`
      - `nvarchar` → `TEXT` o `VARCHAR`
      - `datetime` → `TIMESTAMP`
      - `money` → `NUMERIC(19, 4)`

#### 3. Claves Primarias y Secundarias:
   - Clave primaria compuesta por `site_id` y `order_id` para soportar un entorno multi-cliente.
   - Se añadió `site_id` a todas las relaciones y claves foráneas.

---

### Detalle de Transformaciones por Campo

#### Campos de `Pedidos` → `Orders`:
   - `ID` → `id BIGINT GENERATED ALWAYS AS IDENTITY` (Clave única autonumérica).
   - `FECHA_PEDIDO` → `order_datetime TIMESTAMP` (Fecha y hora del pedido).
   - `PEDIDO` → `order_id BIGINT NOT NULL` (Número único del pedido dentro del sitio).
   - `Marca` → `brand TEXT` (Marca asociada al pedido).
   - `Origen` → `source TEXT` (Origen del pedido).
   - `ACCION` → `action_id TEXT` (ID de la acción asociada, relacionado con `actions`).
   - `REF_CLIENTE` → `customer_id BIGINT` (Referencia al cliente, relacionado con `customers`).
   - `APE` → `last_name TEXT` (Apellido del cliente asociado al pedido).
   - `NOM` → `first_name TEXT` (Nombre del cliente asociado al pedido).
   - `SEXO` → `gender TEXT` (Género del cliente asociado al pedido).
   - `PRIORITAIRE` → `action_priority_id INT` (Tipo de prioridad, relacionado con `actions_priority_types`).
   - `TIPO_PAGO` → `payment_type_id BIGINT NOT NULL` (ID del tipo de pago, relacionado con `orders_payments`).
   - `GESTION_COBRO` → `paid_date DATE DEFAULT NULL` (Fecha en que se realizó el cobro del pedido).
   - `Facturado` → `is_invoiced BOOLEAN DEFAULT FALSE` (Indica si el pedido fue facturado).
   - `LINEAS_PEDIDO` → `order_lines BIGINT DEFAULT 0` (Número total de líneas en el pedido, relacionado con `orders_items`).
   - `Peso` → `weight FLOAT DEFAULT 0` (Peso total del pedido).
   - `ENVIO` → `shipping_cost NUMERIC(19, 4)` (Costo de envío asociado al pedido).
   - `FRAIS` → `mandatory_shipping_fee NUMERIC(19, 4)` (Tarifas obligatorias asociadas al pedido).
   - `TIPO_CLIENTE` → `client_type NUMERIC(18, 0)` (Clasificación del cliente).
   - `PARTICIPANTE` → `participant TEXT` (Participante asociado al pedido).
   - `IMPORTE_PEDIDO` → `order_amount NUMERIC(19,4)` (Monto total del pedido).
   - `BI1` → `bi1 NUMERIC(19,4)` (Base imponible 1).
   - `BI2` → `bi2 NUMERIC(19,4)` (Base imponible 2).
   - `TVA1` → `tva1 NUMERIC(19,4)` (Impuesto 1).
   - `TVA2` → `tva2 NUMERIC(19,4)` (Impuesto 2).
   - `DEVOLUCION` → `return_status TEXT` (Estado de la devolución del pedido).
   - `TIPO_ENVIO` → `shipping_type TEXT` (Tipo de envío).
   - `VALOR` → `value_em NUMERIC(18, 0)` (Valor estimado).
   - `IMPAGADO` → `unpaid BOOLEAN DEFAULT FALSE` (Indica si el pedido está impagado).
   - `IMPORTE_IMPAGO` → `unpaid_amount NUMERIC(19,4)` (Monto impagado).
   - `FECHA_IMPAGADO` → `unpaid_date DATE` (Fecha en que se marcó como impagado).
   - `RECOBRADO` → `recovered BOOLEAN DEFAULT FALSE` (Indica si el monto fue recobrado).
   - `IMPORTE_RECOBRADO` → `recovered_amount NUMERIC(19,4)` (Monto recobrado).
   - `FECHA_RECOBRADO` → `recovery_date DATE` (Fecha en que se recobró el monto).
   - `INCOBRABLE` → `uncollectible BOOLEAN DEFAULT FALSE` (Indica si el monto es incobrable).
   - `IMPORTE_INCOBRABLE` → `uncollectible_amount NUMERIC(19,4)` (Monto incobrable).
   - `FECHA_INCOBRABLE` → `uncollectible_date DATE` (Fecha en que se marcó como incobrable).
   - `CALLCENTER` → `call_center BOOLEAN DEFAULT FALSE` (Indica si el pedido fue gestionado por un call center).
   - `RESERVASTOCK` → `stock_reserved BOOLEAN DEFAULT FALSE` (Indica si el stock fue reservado para el pedido).
   - `ULTIMA_CARTA` → `last_letter TEXT` (Última carta enviada al cliente).
   - `UPSELLING` → `upselling BOOLEAN DEFAULT FALSE` (Indica si el pedido incluye upselling).
   - `COMPRA_UPSELLING` → `upselling_purchase BOOLEAN DEFAULT FALSE` (Indica si se realizó una compra por upselling).
   - `IMPORTE_UPSELLING` → `upselling_amount NUMERIC(19,4)` (Monto de upselling).
   - `GRABADOR` → `created_by TEXT` (Usuario que creó el registro).
   - `MODIFICADOR` → `modified_by TEXT` (Usuario que modificó el registro).
   - `OFERTA_UPSELLING` → `upselling_offer TEXT` (Descripción de la oferta de upselling).
   - `APLAZADO` → `deferred BOOLEAN DEFAULT FALSE` (Indica si el pedido está aplazado).
   - `TRSP` → `transport TEXT` (Método de transporte).
   - `RED10` → `discount NUMERIC(19,4)` (Descuento aplicado al pedido).
   - `IS_PRIVILEGIE` → `privileged BOOLEAN DEFAULT FALSE` (Indica si el pedido tiene privilegio).
   - `IMPCARTECLUB` → `club_card_fee NUMERIC(19,4)` (Costo asociado a la tarjeta del club).
   - `REDCARTECLUB` → `club_card_discount NUMERIC(19,4)` (Descuento asociado a la tarjeta del club).
   - `IS_PESADO` → `is_shipped_by_supplier BOOLEAN DEFAULT FALSE` (Indica si el pedido es enviado por un proveedor).
   - `IS_PESADO_PARCIAL` → `is_partially_shipped_by_supplier BOOLEAN DEFAULT FALSE` (Indica si el pedido es parcialmente enviado por un proveedor).
   - `FOURNISSEUR` → `supplier BOOLEAN DEFAULT FALSE` (Indica si el pedido fue gestionado por un proveedor).
   - `IS_SUSTITUTIVO` → `substitute BOOLEAN DEFAULT FALSE` (Indica si el pedido tiene sustitutos).
   - `IS_SIN_ARTICULO` → `no_article BOOLEAN DEFAULT FALSE` (Indica si el pedido no tiene artículos).
   - `IMP_SINART` → `no_article_amount NUMERIC(19,4)` (Monto de los pedidos sin artículos).
   - `IS_BAV` → `bav BOOLEAN DEFAULT FALSE` (Indica si el pedido incluye un bono de abono).
   - `IMP_BAV` → `bav_amount NUMERIC(19,4)` (Monto asociado al bono de abono).
   - `PEDIDO_BAV` → `bav_order TEXT` (Detalles del bono de abono).
   - `IMP_A_PAGAR` → `amount_due NUMERIC(19,4)` (Monto total a pagar por el pedido).
   - `NextAvailableNumber` → `next_available_number TEXT` (Próximo número disponible para un bono o pedido).
   - `IS_BAV_GENERADO` → `generated_bav BOOLEAN DEFAULT FALSE` (Indica si el bono fue generado).
   - `IMP_BAV_GENERADO` → `generated_bav_amount NUMERIC(19,4)` (Monto generado por el bono de abono).

#### Campos Eliminados:
   - Los campos relacionados con la dirección y el teléfono fueron trasladados a la tabla `orders_addresses`:
      - `DIR1`, `DIR2`, `DIR3`, `DIR4`, `DIR5`, `CP`, `CP_POB`, `POBLACION`, `TEL`.
   
   - Lo campos relacionados con el pago del pedido fueron trasladados a la tabla `orders_payments`:
      - `TIT_CHEQUE`, `Banco`, `NUM_CHEQUE`, `IMP`, `TIT_TARJETA`, `VISA`, `NUM_TARJETA`, `CADUCIDAD`, `COD_VER`, `IMP_TARJ`, `IMP_EFECTIVO`, `IMP_MC`.
   

#### Campos Nuevos:
   - `action_category_id` → Relación con `actions_categories` para categorizar acciones.
   - `action_priority_id` → Relación con `actions_priority_types` para priorizar acciones.
   - `created_by`, `date_created` → Campos para auditoría (creador y fecha de creación).
   - `modified_by`, `date_modified` → Campos para auditoría (modificador y fecha de modificación).

---

### Relación con Tablas Auxiliares

#### 1. orders_addresses (Direcciones de Pedidos):
   - **Propósito**:
     - Almacenar las direcciones de facturación y envío asociadas a cada pedido.
   - **Campos principales**:
     - `billing_*` y `shipping_*`: Almacenan las líneas de dirección, código postal, ciudad y teléfono, tanto para facturación como para envío.
   - **Relación**:
     - Relacionada con `Orders` mediante los campos `site_id` y `order_id`.

---

#### 2. orders_payments (Pagos de Pedidos):
   - **Propósito**:
     - Gestionar los datos relacionados con los pagos de los pedidos, incluyendo métodos como tarjeta, cheque, y efectivo.
   - **Campos principales**:
     - `payment_type`: Tipo de pago (e.g., "Cheque", "Tarjeta").
     - `holder_name`: Nombre del titular del cheque o tarjeta.
     - `amount`: Monto del pago.
     - **Campos específicos de tarjeta**:
       - `card_type_id`: Relación con `orders_payments_card_types`.
       - `card_number`, `expiration_date`, `security_code`: Detalles de la tarjeta.
   - **Relación**:
     - Relacionada con `Orders` mediante `site_id` y `order_id`.

---

#### 3. orders_payments_card_types (Tipos de Tarjetas de Pago):
   - **Propósito**:
     - Almacenar los diferentes tipos de tarjetas aceptados como método de pago, como `VISA`, `MasterCard`, etc.
   - **Campos principales**:
     - `card_type_name`: Nombre del tipo de tarjeta (e.g., `VISA`).
   - **Relación**:
     - Relacionada con `orders_payments` mediante `card_type_id`.

---

### Flujo General

1. **Gestión de Pedidos**:
   - Los pedidos se registran en `Orders` con información básica y relaciones hacia direcciones, pagos, y acciones.

2. **Gestión de Direcciones**:
   - Las direcciones se almacenan en `orders_addresses` para facturación y envío.

3. **Gestión de Pagos**:
   - Los pagos se registran en `orders_payments`, con tipos de tarjeta referenciados en `orders_payments_card_types`.

4. **Gestión de Acciones**:
   - Cada pedido puede estar asociado con una acción mediante `action_id`.

---

### Ejemplo de Inserción de Datos

#### 1. Insertar un pedido con direcciones:
```sql
INSERT INTO orders_addresses (order_id, site_id, billing_customer_name, billing_address_line1, shipping_customer_name, shipping_address_line1)
VALUES (1, 1, 'John Doe', '123 Billing St', 'John Doe', '456 Shipping Ave');
```

#### 2. Insertar un tipo de tarjeta:
```sql
INSERT INTO orders_payments_card_types (card_type_name) VALUES ('VISA');
```

#### 3. Insertar un pago con tarjeta:
```sql
INSERT INTO orders_payments (site_id, order_id, payment_type, holder_name, amount, card_type_id, card_number, expiration_date, security_code)
VALUES (1, 1, 'Card', 'John Doe', 100.00, 1, 1234567890123456, '12/25', 123);
```

### Consultas de ejemplo

#### 1. Consultar Detalles de un Pedido
```sql
SELECT o.order_id, o.order_datetime, o.order_amount, 
       c.first_name, c.last_name, 
       a.action_name, a.launch_date
FROM orders o
JOIN customers c ON o.site_id = c.site_id AND o.customer_id = c.customer_id
JOIN actions a ON o.site_id = a.site_id AND o.action_id = a.action_id
WHERE o.site_id = 1 AND o.order_id = 12345;
```
   - **Objetivo:** Obtener detalles del pedido, incluyendo cliente y acción asociada.

#### 2. Consultar Pedidos por Prioridad
```sql
SELECT o.order_id, o.order_datetime, o.order_amount, 
       p.priority_name, c.category_name
FROM orders o
JOIN actions_priority_types p ON o.site_id = p.site_id AND o.priority_id = p.action_priority_id
JOIN actions_categories c ON o.site_id = c.site_id AND o.category_id = c.action_category_id
WHERE p.priority_name = 'EXPRESS' AND o.site_id = 1;
```
   - **Objetivo:** Listar pedidos con prioridad "EXPRESS" de un cliente específico.

#### 3. Consultar Costes de Envío y Tarifas por Pedido
```sql
SELECT o.order_id, o.shipping_cost, o.mandatory_shipping_fee, 
       a.action_name, p.priority_name
FROM orders o
JOIN actions a ON o.site_id = a.site_id AND o.action_id = a.action_id
JOIN actions_priority_types p ON o.site_id = p.site_id AND o.priority_id = p.action_priority_id
WHERE o.site_id = 1 AND o.shipping_cost > 0;
```
   - **Objetivo:** Ver los costes de envío y tarifas obligatorias para pedidos con envío asociado.

#### 4. Consultar Pagos Asociados a un Pedido
```sql
SELECT o.order_id, p.payment_type, p.amount, 
       p.holder_name, ct.card_type_name
FROM orders o
JOIN orders_payments p ON o.site_id = p.site_id AND o.order_id = p.order_id
LEFT JOIN orders_payments_card_types ct ON p.card_type_id = ct.card_type_id
WHERE o.site_id = 1 AND o.order_id = 12345;
```
   - **Objetivo:** Obtener detalles de los pagos realizados para un pedido, incluyendo tipo de tarjeta si corresponde.

#### 5. Consultar Pedidos con Clientes y Direcciones
```sql
SELECT o.order_id, o.order_datetime, c.first_name, c.last_name, 
       a.billing_address_line1, a.shipping_address_line1
FROM orders o
JOIN customers c ON o.site_id = c.site_id AND o.customer_id = c.customer_id
JOIN orders_addresses a ON o.site_id = a.site_id AND o.order_id = a.order_id
WHERE o.site_id = 1;
```
   - **Objetivo:** Mostrar pedidos junto con información básica del cliente y sus direcciones.

#### 6. Contar Pedidos por Prioridad
```sql
SELECT p.priority_name, COUNT(*) AS total_orders
FROM orders o
JOIN actions_priority_types p ON o.site_id = p.site_id AND o.priority_id = p.action_priority_id
WHERE o.site_id = 1
GROUP BY p.priority_name;
```
   - **Objetivo:** Contar el número de pedidos según su prioridad.

#### 7. Consultar Pedidos No Pagados
```sql
SELECT o.order_id, o.order_datetime, o.order_amount, 
       c.first_name, c.last_name
FROM orders o
JOIN customers c ON o.site_id = c.site_id AND o.customer_id = c.customer_id
WHERE o.site_id = 1 AND o.is_paid = FALSE;
```
   - **Objetivo:** Listar todos los pedidos pendientes de pago para un cliente específico.

#### 8. Consultar Ingresos Totales por Mes
```sql
SELECT DATE_TRUNC('month', o.order_datetime) AS order_month, 
       SUM(o.order_amount) AS total_income
FROM orders o
WHERE o.site_id = 1
GROUP BY order_month
ORDER BY order_month;
```
   - **Objetivo:** Calcular los ingresos totales por mes para un cliente.

---

## 2. Order Items (Líneas de Pedido)

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
   - `MARCA` → `brand TEXT` (Marca del producto).
   - `IS_SUSTITUTIVO` → `is_substitute BOOLEAN DEFAULT FALSE` (Indica si es un producto sustitutivo).
   - `ID_REF_SUST` → `substitute_product_ref TEXT` (Referencia del producto sustitutivo).
   - `REF_SUST` → `substitute_catalog_ref TEXT` (Referencia en el catálogo del sustitutivo).
   - `CATALOGO_SUST` → `substitute_catalog_code TEXT` (Código del catálogo del sustitutivo).
   - `CANT_SUST` → `substitute_quantity INT` (Cantidad sustitutiva).
   - `DESC_SUST` → `substitute_description TEXT` (Descripción del artículo sustitutivo).
   - `IMP_SUST` → `substitute_import NUMERIC(19, 4)` (Importe del artículo sustitutivo).
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

---

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

---

## 3. Actions (Acciones):

### Cambios realizados desde `Acciones` a `Actions`:

#### 1. General:
   - Cambiado el nombre de la tabla de `Acciones` a `actions` para estandarizar en inglés y en `snake_case`.
   - Los campos fueron traducidos y adaptados a PostgreSQL.
   - Se desglosaron en cuatro tablas relacionadas para mejorar la modularidad:
      1. `actions`: Información general de las acciones.
      2. `actions_categories`: Categorías asociadas a las acciones.
      3. `actions_priority_types`: Tipos de prioridad aplicables.
      4. `actions_category_costs`: Costos asociados según la categoría y prioridad.

#### 2. Tipos de Datos:
   - Adaptados a PostgreSQL:
      - `nvarchar` → `TEXT`
      - `datetime` → `TIMESTAMP`
      - `money` → `NUMERIC(19, 4)`
      - `int` → `BIGINT`

#### 3. Claves Primarias y Secundarias:
   - Añadido `site_id` como parte de las claves primarias para soportar un entorno multi-cliente.
   - Claves foráneas para relacionar con las tablas auxiliares:
      - `actions_categories`.
      - `actions_priority_types`.

---

### Detalle de Transformaciones por Campo

#### Campos de `Acciones` → `actions`:
   - `ACCION` → `action_id BIGINT GENERATED ALWAYS AS IDENTITY` (Identificador único de la acción).
   - `DESCRIPCION` → `description TEXT` (Descripción de la acción).
   - `FECHA_LANZAMIENTO` → `launch_date TIMESTAMP` (Fecha de lanzamiento).
   - `Marca` → `brand TEXT` (Marca asociada a la acción).
   - `TIRADA` → `print_run INT` (Cantidad de impresiones).
   - `DATE_DEPOT` → `deposit_date TIMESTAMP` (Fecha de depósito).
   - `ESTADO` → `is_active BOOLEAN DEFAULT TRUE` (Estado de la acción).
   - `CODE_CATALOGUE` → `catalog_code TEXT` (Código del catálogo).
   - `LOT_CATALOGUE` → `catalog_lot TEXT` (Lote del catálogo).
   - `DESC_CATALOGUE` → `catalog_description TEXT` (Descripción del catálogo).

#### Campos Eliminados:
   - `PRIORITAIRE`, `FRAIS`, `EXPRESS`, `POINT_RELAIS`:
     - Estos campos fueron movidos y gestionados en las tablas auxiliares `actions_category_costs` y `actions_priority_types`.

#### Campos Nuevos:
   - `action_category_id` → Relación con `actions_categories` para categorizar acciones.
   - `created_by`, `date_created` → Campos para auditoría (creador y fecha de creación).
   - `modified_by`, `date_modified` → Campos para auditoría (modificador y fecha de modificación).

---

### Relación con Tablas Auxiliares

#### 1. actions_categories (Categorías de Acciones):
   - **Propósito**:
     - Clasificar las acciones en categorías generales.
   - **Campos**:
     - `action_category_id BIGINT`: Identificador único de la categoría.
     - `category_name TEXT`: Nombre descriptivo de la categoría.
     - `description TEXT`: Descripción de la categoría.
   - **Relación**:
     - Relacionada con `actions` mediante `action_category_id`.

#### 2. actions_priority_types (Tipos de Prioridad):
   - **Propósito**:
     - Almacenar los tipos de prioridad aplicables a las acciones (e.g., "NORMAL", "EXPRESS").
   - **Campos**:
     - `action_priority_id BIGINT`: Identificador único de la prioridad.
     - `priority_name TEXT`: Nombre descriptivo de la prioridad.
   - **Relación**:
     - Utilizada en `actions_category_costs` para definir costos según la prioridad.

#### 3. actions_category_costs (Costos por Categoría y Prioridad):
   - **Propósito**:
     - Gestionar los costos específicos asociados a cada categoría y tipo de prioridad.
   - **Campos**:
     - `category_cost_id BIGINT`: Identificador único del costo.
     - `action_category_id BIGINT`: Categoría asociada al costo.
     - `action_priority_id BIGINT`: Tipo de prioridad asociado al costo.
     - `shipping_cost NUMERIC(19, 4)`: Costo de envío asociado.
     - `mandatory_fee NUMERIC(19, 4)`: Tarifa adicional.
   - **Relaciones**:
     - Con `actions_categories` mediante `action_category_id`.
     - Con `actions_priority_types` mediante `action_priority_id`.

---

### Flujo General

1. **Definición de Categorías y Prioridades**:
   - Las categorías (`actions_categories`) y prioridades (`actions_priority_types`) se definen de manera independiente.

2. **Creación de Acciones**:
   - Cada acción en `actions` se relaciona con una categoría y se describe con detalles generales.

3. **Gestión de Costos**:
   - `actions_category_costs` combina categorías y prioridades para definir costos específicos, como tarifas y envíos.

4. **Relación con Pedidos**:
   - Las acciones se asocian a pedidos en `Orders` mediante `action_id`.

### Ejemplos de Inserción de Datos para Actions

#### 1. Insertar una Categoría de Acción
```sql
INSERT INTO actions_categories (site_id, category_name, description, created_by) VALUES 
(1, 'Envío Estándar', 'Acciones de envío estándar', 'admin'),
(1, 'Promoción Exprés', 'Acciones de promoción con envío rápido', 'admin');
```

#### 2. Insertar un Tipo de Prioridad
```sql
INSERT INTO actions_priority_types (site_id, priority_name, created_by) VALUES (1, 'NORMAL', 'admin'), (1, 'EXPRESS', 'admin');
```

#### 3. Insertar Costes por Categoría y Prioridad
```sql
INSERT INTO actions_category_costs (site_id, action_category_id, action_priority_id, shipping_cost, mandatory_fee, created_by)
VALUES 
(1, 1, 1, 5.00, 1.50, 'admin'),  -- Costo para Envío Estándar con Prioridad NORMAL
(1, 1, 2, 10.00, 2.00, 'admin'), -- Costo para Envío Estándar con Prioridad EXPRESS
(1, 2, 2, 15.00, 3.50, 'admin'); -- Costo para Promoción Exprés con Prioridad EXPRESS
```

#### 4. Insertar una Acción
```sql
INSERT INTO actions (site_id, action_name, description, launch_date, deposit_date, action_category_id, created_by)
VALUES 
(1, 'Primavera 2024', 'Campaña de Primavera', '2024-03-01', '2024-03-15', 1, 'admin'),
(1, 'Promoción Verano', 'Campaña de Verano', '2024-06-01', '2024-06-20', 2, 'admin');
```

### Consultas de ejemplo

#### 1. Consultar Acciones por Categoría
```sql
SELECT a.action_name, c.category_name, c.description
FROM actions a
JOIN actions_categories c ON a.action_category_id = c.action_category_id
WHERE a.site_id = 1;
```
#### 2. Consultar Costes de Envío por Prioridad
```sql
SELECT c.category_name, p.priority_name, costs.shipping_cost, costs.mandatory_fee
FROM actions_category_costs costs
JOIN actions_categories c ON costs.action_category_id = c.action_category_id
JOIN actions_priority_types p ON costs.action_priority_id = p.action_priority_id
WHERE costs.site_id = 1;
```
---

## 4. Customers (Clientes):

### Cambios realizados desde `Clientes` a `customers`:

#### 1. General:
   - Cambiado el nombre de la tabla de `Clientes` a `customers` para estandarizar en inglés y en `snake_case`.
   - Desglosada en tres tablas:
      1. `customers`: Información general del cliente, incluyendo direcciones de facturación y envío.
      2. `customers_rnvp_types`: Gestión de los tipos de RNVP (p. ej., "No contactar", "Correo devuelto").
      3. `customers_marked_types`: Gestión de los tipos de marcado para los clientes.

#### 2. Tipos de Datos:
   - Los tipos de datos fueron adaptados a PostgreSQL:
      - `nvarchar` → `TEXT`
      - `datetime` → `TIMESTAMP`
      - `bit` → `BOOLEAN`
      - `date` → `DATE`

#### 3. Claves Primarias y Secundarias:
   - Clave primaria compuesta por `site_id` y `customer_id` en `customers`.
   - Claves foráneas añadidas:
      - `rnvp_type_id` en `customers` → Relaciona con `customers_rnvp_types`.
      - `marked_type_id` en `customers` → Relaciona con `customers_marked_types`.

---

### Detalle de Transformaciones por Campo

#### Campos de `Clientes` → `customers`:
   - `NUMERO_DE_CLIENT` → `customer_id BIGINT` (Identificador único del cliente).
   - `NOMBRE` → Eliminado y desglosado en:
     - `billing_first_name`, `billing_last_name` (Nombre y apellido para facturación).
     - `shipping_first_name`, `shipping_last_name` (Nombre y apellido para envío).
   - `DIR1`, `DIR2`, `DIR3`, `DIR4`, `DIR5` → Desglosados en:
     - `billing_address_line1` a `billing_address_cp`, `billing_address_city` (Dirección de facturación).
     - `shipping_address_line1` a `shipping_address_cp`, `shipping_address_city` (Dirección de envío).
   - `TEL` → `phone TEXT` (Teléfono general del cliente).
   - `SEXO` → Desglosado en:
     - `billing_gender` y `shipping_gender` (Género para facturación y envío).
   - `P1` → `npai TEXT` (NPAI: No puede atender el pedido).
   - `Q1` → `rfm TEXT` (Segmentación RFM del cliente).
   - `R1` → `credit_risk TEXT` (Identificación de riesgo crediticio).
   - `S1` → `source_origin TEXT` (Origen del cliente).
   - `MARCADO` → Relacionado con `customers_marked_types` mediante `marked_type_id`.
   - `RNVP` → Relacionado con `customers_rnvp_types` mediante `rnvp_type_id`.
   - `PRIVILEGIE` → `privileged BOOLEAN` (Indica si es un cliente privilegiado).
   - `DATE_PRIVILEGIE` → `privileged_date DATE` (Fecha en que fue marcado como privilegiado).

#### Campos Eliminados:
   - `ENCARTE`: No se utiliza en la nueva estructura.
   - `DATE_CLIENT`: Ahora se maneja como `created_at TIMESTAMP`.

#### Campos Nuevos:
   - `is_under_guardianship` → Indica si el cliente está bajo tutela legal.
   - `is_deceased` → Indica si el cliente está fallecido.
   - `do_not_contact` → Indica si el cliente solicitó no ser contactado (ROBINSON).

---

### Relación con Tablas Auxiliares

#### 1. customers_rnvp_types:
   - **Propósito**:
     - Almacenar los tipos de RNVP (e.g., "Correo devuelto", "No puede atender pedido").
   - **Campos principales**:
     - `rnvp_type_id BIGINT`: Identificador único del tipo.
     - `name TEXT`: Nombre del tipo de RNVP.
     - `description TEXT`: Descripción detallada.

---

#### 2. customers_marked_types:
   - **Propósito**:
     - Almacenar los tipos de marcado para clasificar clientes.
   - **Campos principales**:
     - `marked_type_id BIGINT`: Identificador único del tipo.
     - `name TEXT`: Nombre del tipo de marcado.
     - `description TEXT`: Descripción detallada.

---

### Flujo General

1. **Gestión de Información General**:
   - `customers` almacena información principal, incluyendo direcciones de facturación y envío, además de datos básicos como género, teléfono, y correo.

2. **Gestión de Tipos de RNVP**:
   - `customers_rnvp_types` permite definir y gestionar los tipos de RNVP asociados a los clientes.

3. **Gestión de Tipos de Marcado**:
   - `customers_marked_types` organiza los tipos de marcado aplicables a los clientes para análisis o segmentación.

---

### Ejemplo de Inserciones

#### 1. Insertar un Cliente:
```sql
INSERT INTO customers (site_id, customer_id, billing_first_name, billing_last_name, shipping_first_name, shipping_last_name, phone, email, rnvp_type_id, marked_type_id, privileged, created_by)
VALUES 
(1, 1001, 'John', 'Doe', 'John', 'Doe', '123456789', 'john.doe@example.com', 1, 2, TRUE, 'admin');
```

#### 2. Insertar un Tipo de RNVP:
```sql
INSERT INTO customers_rnvp_types (name, description)
VALUES 
('ROBINSON', 'El cliente solicitó no ser contactado');
```

#### 3. Insertar un Tipo de Marcado:
```sql
INSERT INTO customers_marked_types (name, description)
VALUES 
('Moroso', 'Cliente con historial de pagos atrasados');
```

#### 4. Consultar Clientes con RNVP y Marcado:
```sql
SELECT c.customer_id, c.billing_first_name, c.billing_last_name, rnvp.name AS rnvp_type, marked.name AS marked_type
FROM customers c
LEFT JOIN customers_rnvp_types rnvp ON c.rnvp_type_id = rnvp.rnvp_type_id
LEFT JOIN customers_marked_types marked ON c.marked_type_id = marked.marked_type_id
WHERE c.site_id = 1;
```

---

# NOTAS:
## Orden ejecución scripts:
   1. customers_rnvp_types
   2. customers_marked_types
   3. sites
   4. customers
   5. orders_payments_card_types
   6. orders_payments
   7. Orders