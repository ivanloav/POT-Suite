# Orders (Pedidos)

## Índice
- [Cambios realizados desde `Pedidos` a `Orders`](#cambios-realizados-desde-pedidos-a-orders)
- [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
- [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares)
  - [orders_addresses (Direcciones de Pedidos)](#1-orders_addresses-direcciones-de-pedidos)
  - [orders_payments (Pagos de Pedidos)](#2-orders_payments-pagos-de-pedidos)
  - [orders_payments_card_types (Tipos de Tarjetas de Pago)](#3-orders_payments_card_types-tipos-de-tarjetas-de-pago)
  - [Flujo General](#flujo-general)
- [Ejemplo de Inserción de Datos](#ejemplo-de-inserción-de-datos)
- [Consultas de Ejemplo](#consultas-de-ejemplo)

---

## Cambios realizados desde `Pedidos` a `Orders`

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
   - `CALLCENTER` → `is_callcenter BOOLEAN DEFAULT FALSE` (Indica si el pedido fue gestionado por un call center).
   - `RESERVASTOCK` → `is_stock_reserved BOOLEAN DEFAULT FALSE` (Indica si el stock fue reservado para el pedido).
   - `ULTIMA_CARTA` → `last_letter TEXT` (Última carta enviada al cliente).
   - `UPSELLING` → `is_upselling BOOLEAN DEFAULT FALSE` (Indica si el pedido incluye upselling).
   - `COMPRA_UPSELLING` → `is_upselling_purchase BOOLEAN DEFAULT FALSE` (Indica si se realizó una compra por upselling).
   - `IMPORTE_UPSELLING` → `upselling_amount NUMERIC(19,4)` (Monto de upselling).
   - `GRABADOR` → `created_by TEXT` (Usuario que creó el registro. **Movidos al final de la tabla**).
   - `MODIFICADOR` → `updated_by TEXT` (Usuario que modificó el registro. **Movidos al final de la tabla**).
   - `OFERTA_UPSELLING` → `upselling_offer TEXT` (Descripción de la oferta de upselling).
   - `APLAZADO` → `is_deferred BOOLEAN DEFAULT FALSE` (Indica si el pedido está aplazado).
   - `TRSP` → `transport TEXT` (Método de transporte).
   - `RED10` → `discount NUMERIC(19,4)` (Descuento aplicado al pedido).
   - `IS_PRIVILEGIE` → `privileged BOOLEAN DEFAULT FALSE` (Indica si el pedido tiene privilegio).
   - `IMPCARTECLUB` → `club_card_fee NUMERIC(19,4)` (Costo asociado a la tarjeta del club).
   - `REDCARTECLUB` → `club_card_discount NUMERIC(19,4)` (Descuento asociado a la tarjeta del club).
   - `IS_PESADO` → `is_shipped_by_supplier BOOLEAN DEFAULT FALSE` (Indica si el pedido es enviado por un proveedor).
   - `IS_PESADO_PARCIAL` → `is_partially_shipped_by_supplier BOOLEAN DEFAULT FALSE` (Indica si el pedido es parcialmente enviado por un proveedor).
   - `FOURNISSEUR` → `is_supplier BOOLEAN DEFAULT FALSE` (Indica si el pedido fue gestionado por un proveedor).
   - `IS_SUSTITUTIVO` → `is_substitute BOOLEAN DEFAULT FALSE` (Indica si el pedido tiene sustitutos).
   - `IS_SIN_ARTICULO` → `is_no_article BOOLEAN DEFAULT FALSE` (Indica si el pedido no tiene artículos).
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
   
   - Lo campos relacionados con el pago del pedido y su estado fueron trasladados a la tabla `orders_payments`:
      - `TIT_CHEQUE`, `Banco`, `NUM_CHEQUE`, `IMP`, `TIT_TARJETA`, `VISA`, `NUM_TARJETA`, `CADUCIDAD`, `COD_VER`, `IMP_TARJ`, `IMP_EFECTIVO`, `IMP_MC`, `IMPAGADO`, `IMPORTE_IMPAGO`, `FECHA_IMPAGADO`, `RECOBRADO`, `IMPORTE_RECOBRADO` , `FECHA_RECOBRADO`, `INCOBRABLE`, `IMPORTE_INCOBRABLE`, `FECHA_INCOBRABLE`.
   

#### Campos Nuevos:
   - `action_category_id` → Relación con `actions_categories` para categorizar acciones.
   - `action_priority_id` → Relación con `actions_priority_types` para priorizar acciones.
   - `is_annuled` → Campo para anular un pedido
   - `annuled_date` → Campo para saber la fecha de anulación del pedido
   - `annuled_by` → Campo para saber qué usuario anula el pedido
   - `created_at` → Campos para auditoría (creador y fecha de creación).
   - `updated_at` → Campos para auditoría (modificador y fecha de modificación).

---

### Relación con Tablas Auxiliares

#### 1. orders_addresses (Direcciones de Pedidos)
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
   - **Campos del estado del pago del pedido**
      - `IMPAGADO` → `unpaid BOOLEAN DEFAULT FALSE` (Indica si el pedido está impagado).
      - `IMPORTE_IMPAGO` → `unpaid_amount NUMERIC(19,4)` (Monto impagado).
      - `FECHA_IMPAGADO` → `unpaid_date DATE` (Fecha en que se marcó como impagado).
      - `RECOBRADO` → `recovered BOOLEAN DEFAULT FALSE` (Indica si el monto fue recobrado).
      - `IMPORTE_RECOBRADO` → `recovered_amount NUMERIC(19,4)` (Monto recobrado).
      - `FECHA_RECOBRADO` → `recovery_date DATE` (Fecha en que se recobró el monto).
      - `INCOBRABLE` → `uncollectible BOOLEAN DEFAULT FALSE` (Indica si el monto es incobrable).
      - `IMPORTE_INCOBRABLE` → `uncollectible_amount NUMERIC(19,4)` (Monto incobrable).
      - `FECHA_INCOBRABLE` → `uncollectible_date DATE` (Fecha en que se marcó como incobrable).
      
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
