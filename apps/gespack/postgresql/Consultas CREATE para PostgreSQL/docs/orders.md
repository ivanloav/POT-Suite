# orders (Pedidos)

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

* Tabla `orders` diseñada para registrar la información principal de cada pedido.
* Clave primaria técnica `order_id` y uso obligatorio de `site_id` para entornos multicliente.

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `datetime` → `TIMESTAMP`
* `money` → `NUMERIC(19, 4)`
* `nvarchar` → `TEXT`

#### 3. Claves e Índices:

* Clave primaria: `order_id`
* Relaciones con claves foráneas: `customer_id`, `brand_id`, `action_id`, etc.

---

### Detalle de Transformaciones por Campo

> Se incluyen **todos los campos** del script SQL original:

| Campo original      | Campo nuevo                          | Tipo PostgreSQL | Comentario                          |
| ------------------- | ------------------------------------ | --------------- | ----------------------------------- |
| ID                  | order_id                             | BIGINT          | Clave primaria autonumérica         |
| ID_SITE             | site_id                              | BIGINT          | Identificador del sitio             |
| FECHA_PEDIDO        | order_datetime                       | TIMESTAMP       | Fecha y hora del pedido             |
| PEDIDO              | order_reference                      | TEXT            | Código o número del pedido          |
| Marca               | brand_id                             | BIGINT          | Marca relacionada                   |
| Origen              | source                               | TEXT            | Canal de origen                     |
| ACCION              | action_id                            | BIGINT          | Acción asociada                     |
| Categoría           | action_category_id                   | INT             | Categoría de acción                 |
| Tipo de prioridad   | action_priority_id                   | INT             | Tipo de prioridad                   |
| ENVIO               | shipping_cost                        | NUMERIC(19, 4)  | Coste del envío                     |
| FRAIS               | mandatory_shipping_fee               | NUMERIC(19, 4)  | Coste obligatorio                   |
| REF_CLIENTE         | customer_id                          | BIGINT          | Cliente asociado                    |
| SEXO                | gender                               | TEXT            | Género                              |
| NOM                 | first_name                           | TEXT            | Nombre                              |
| APE                 | last_name                            | TEXT            | Apellido                            |
| TIPO_PAGO           | payment_type_id                      | BIGINT          | Tipo de pago (FK a order_payments)  |
| COBRADO             | is_paid                              | BOOLEAN         | ¿Está cobrado?                      |
| GESTION_COBRO       | paid_date                            | DATE            | Fecha de cobro                      |
| Facturado           | is_invoiced                          | BOOLEAN         | ¿Está facturado?                    |
| Fecha Facturado     | invoiced_date                        | DATE            | Fecha de facturación                |
| LINEAS_PEDIDO       | order_lines                          | BIGINT          | Número de líneas                    |
| Peso                | weight                               | FLOAT           | Peso total del pedido               |
| TIPO_CLIENTE        | client_type                          | NUMERIC(18, 0)  | Tipo de cliente                     |
| PARTICIPANTE        | participant                          | TEXT            | Participante                        |
| IMPORTE_PEDIDO      | order_amount                         | NUMERIC(19, 4)  | Importe total del pedido            |
| BI1                 | bi1                                  | NUMERIC(19, 4)  | Base imponible 1                    |
| BI2                 | bi2                                  | NUMERIC(19, 4)  | Base imponible 2                    |
| TVA1                | tva1                                 | NUMERIC(19, 4)  | IVA 1                               |
| TVA2                | tva2                                 | NUMERIC(19, 4)  | IVA 2                               |
| DEVOLUCION          | return_status                        | TEXT            | Estado de devolución                |
| TIPO_ENVIO          | shipping_type                        | TEXT            | Tipo de envío                       |
| VALOR               | value_em                             | NUMERIC(18, 0)  | Valor declarado                     |
| CALLCENTER          | is_callcenter                        | BOOLEAN         | ¿Procede del callcenter?            |
| RESERVASTOCK        | is_stock_reserved                    | BOOLEAN         | ¿Stock reservado?                   |
| ULTIMA_CARTA        | last_letter                          | TEXT            | Última carta enviada                |
| UPSELLING           | is_upselling                         | BOOLEAN         | ¿Tiene upselling?                   |
| COMPRA_UPSELLING    | is_upselling_purchase                | BOOLEAN         | ¿Fue compra por upselling?          |
| IMPORTE_UPSELLING   | upselling_amount                     | NUMERIC(19, 4)  | Importe upselling                   |
| OFERTA_UPSELLING    | upselling_offer                      | TEXT            | Oferta de upselling                 |
| APLAZADO            | is_deferred                          | BOOLEAN         | ¿Pedido aplazado?                   |
| TRSP                | transport                            | TEXT            | Transportista                       |
| RED10               | discount                             | NUMERIC(19, 4)  | Descuento del 10%                   |
| IS_PRIVILEGIE       | is_privileged                        | BOOLEAN         | ¿Cliente privilegiado?              |
| IMPCARTECLUB        | club_card_fee                        | NUMERIC(19, 4)  | Importe de tarjeta club             |
| REDCARTECLUB        | club_card_discount                   | NUMERIC(19, 4)  | Descuento tarjeta club              |
| IS_PESADO           | is_shipped_by_supplier               | BOOLEAN         | ¿Envío del proveedor?               |
| IS_PESADO_PARCIAL   | is_partially_shipped_by_supplier     | BOOLEAN         | ¿Envío parcial proveedor?           |
| FOURNISSEUR         | is_supplier                          | BOOLEAN         | ¿Proveedor?                         |
| IS_SUSTITUTIVO      | is_substitute                        | BOOLEAN         | ¿Contiene sustitutivos?             |
| IS_SIN_ARTICULO     | is_no_article                        | BOOLEAN         | ¿Sin artículo?                      |
| IMP_SINART          | no_article_amount                    | NUMERIC(19, 4)  | Importe sin artículo                |
| IS_BAV              | is_bav                               | BOOLEAN         | ¿Pedido BAV?                        |
| IMP_BAV             | bav_amount                           | NUMERIC(19, 4)  | Importe BAV                         |
| PEDIDO_BAV          | bav_order                            | TEXT            | Código del pedido BAV               |
| IMP_A_PAGAR         | amount_due                           | NUMERIC(19, 4)  | Importe a pagar                     |
| NextAvailableNumber | next_available_number                | TEXT            | Número siguiente disponible         |
| IS_BAV_GENERADO     | is_generated_bav                     | BOOLEAN         | ¿BAV generado automáticamente?      |
| IMP_BAV_GENERADO    | generated_bav_amount                 | NUMERIC(19, 4)  | Importe generado para BAV           |
| ANULADO             | is_annulled                          | BOOLEAN         | ¿Pedido anulado?                    |
| FECHA_ANULADO       | annulled_by                          | DATE            | Fecha de anulación                  |
| ANULADO_POR         | annulled_by                          | TEXT            | Usuario que anuló                   |
| GRABADOR            | created_by                           | TEXT            | Usuario que registró el pedido      |
| FECHA_GRABACION     | created_at                           | TIMESTAMP       | Fecha de creación                   |
| MODIFICADOR         | modified_by                          | TEXT            | Usuario que modificó                |
| FECHA_MODIFICACION  | updated_at                          | TIMESTAMP       | Fecha de modificación               |

---

### Relación con otras Tablas

* `brands`: relación por `brand_id`
* `customers`: relación por `customer_id`
* `actions`: relación por `action_id`
* `actions_categories`: relación por `action_category_id`
* `actions_priority_types`: relación por `action_priority_id`
* `order_payments`: relación por `payment_type_id`
* `order_items`, `order_addresses`, `order_notes`: relaciones hijas por `order_id`

---

### Flujo General

Esta tabla representa el encabezado principal de cada pedido. Centraliza los datos de cliente, marca, acción comercial y costes asociados. Las tablas hijas amplían el detalle (líneas, pagos, direcciones, notas).

---

### Ejemplo de Inserciones

```sql
INSERT INTO orders (site_id, order_datetime, order_reference, brand_id, source, customer_id)
VALUES (1, CURRENT_TIMESTAMP, 'PO-2025-001', 3, 'web', 101);
```

---

### Índices recomendados

```sql
CREATE INDEX idx_orders_order_id ON orders (order_id);
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_order_reference ON orders (site_id, order_reference);
```
