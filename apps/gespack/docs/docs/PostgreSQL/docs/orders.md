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

* Campo de anulación renombrado: **`annulled_date` → `annulled_at`** (TIMESTAMP/DATE según diseño).
* **Auditoría de usuarios con FK**: se descompone el grabador/anulador en **ID + nombre**
  * `created_by_id` (FK a `users.user_id`, **ON DELETE RESTRICT**) y `created_by_name` (snapshot del nombre visible).
  * `annulled_by_id` (FK a `users.user_id`, **ON DELETE RESTRICT**) y `annulled_by_name`.
* Normalización nombres de fechas: `paid_at`, `invoiced_at`.
* Sustituido `source TEXT` → **`order_source_id BIGINT` (FK compuesta `site_id, order_source_id` a `order_sources`)**.

---

### Detalle de Transformaciones por Campo

> Se listan los campos relevantes (manteniendo el mapeo al script SQL):

| Campo original        | Campo nuevo                        | Tipo PostgreSQL | Comentario                                 |
| --------------------- | ---------------------------------- | --------------- | ------------------------------------------ |
| ID                    | `order_id`                         | BIGINT          | PK técnica                                  |
| ID_SITE               | `site_id`                          | BIGINT          | Identificador del site                      |
| FECHA_PEDIDO          | `order_datetime`                   | TIMESTAMP       | Fecha/hora del pedido                       |
| PEDIDO                | `order_reference`                  | TEXT            | Referencia de pedido (única por site)       |
| Marca                 | `brand_id`                         | BIGINT          | FK a `brands`                               |
| Origen                | `order_source_id`                  | BIGINT          | **FK a `order_sources` (canal de origen)**  |
| ACCION                | `action_id`                        | BIGINT          | FK a `actions`                              |
| Categoría             | `action_category_id`               | INT             | FK a `action_categories`                    |
| Tipo de prioridad     | `action_priority_id`               | INT             | FK a `action_priority_types`                |
| ENVIO                 | `shipping_cost`                    | NUMERIC(19,4)   | Coste envío                                 |
| FRAIS                 | `mandatory_shipping_fee`           | NUMERIC(19,4)   | Tasas obligatorias                          |
| REF_CLIENTE           | `customer_id`                      | BIGINT          | FK a `customers`                            |
| SEXO                  | `gender`                           | TEXT            | Género                                      |
| NOM                   | `first_name`                       | TEXT            | Nombre                                      |
| APE                   | `last_name`                        | TEXT            | Apellido                                    |
| TIPO_PAGO             | `payment_type_id`                  | BIGINT          | FK a `order_payments`                       |
| COBRADO               | `is_paid`                          | BOOLEAN         | Estado de cobro                             |
| GESTION_COBRO         | `paid_at`                          | DATE            | Fecha de cobro                              |
| Facturado             | `is_invoiced`                      | BOOLEAN         | Facturado                                   |
| Fecha Facturado       | `invoiced_at`                      | DATE            | Fecha de facturación                        |
| LINEAS_PEDIDO         | `order_lines`                      | BIGINT          | Nº de líneas                                |
| Peso                  | `weight`                           | FLOAT           | Peso total                                  |
| TIPO_CLIENTE          | `client_type`                      | NUMERIC(18,0)   | Tipo de cliente                              |
| PARTICIPANTE          | `participant`                      | TEXT            | Participante                                 |
| IMPORTE_PEDIDO        | `order_amount`                     | NUMERIC(19,4)   | Importe total                                |
| BI1                   | `bi1`                              | NUMERIC(19,4)   | Base imponible 1                             |
| BI2                   | `bi2`                              | NUMERIC(19,4)   | Base imponible 2                             |
| TVA1                  | `tva1`                             | NUMERIC(19,4)   | IVA 1                                        |
| TVA2                  | `tva2`                             | NUMERIC(19,4)   | IVA 2                                        |
| DEVOLUCION            | `return_status`                    | TEXT            | Estado devolución                            |
| TIPO_ENVIO            | `shipping_type`                    | TEXT            | Tipo de envío                                |
| VALOR                 | `value_em`                         | NUMERIC(18,0)   | Valor declarado                              |
| CALLCENTER            | `is_callcenter`                    | BOOLEAN         | Flag callcenter                              |
| RESERVASTOCK          | `is_stock_reserved`                | BOOLEAN         | Stock reservado                              |
| ULTIMA_CARTA          | `last_letter`                      | TEXT            | Última carta                                  |
| UPSELLING             | `is_upselling`                     | BOOLEAN         | Tiene upselling                              |
| COMPRA_UPSELLING      | `is_upselling_purchase`            | BOOLEAN         | Compra por upselling                         |
| IMPORTE_UPSELLING     | `upselling_amount`                 | NUMERIC(19,4)   | Importe upselling                            |
| OFERTA_UPSELLING      | `upselling_offer`                  | TEXT            | Oferta upselling                              |
| APLAZADO              | `is_deferred`                      | BOOLEAN         | Pedido aplazado                               |
| TRSP                  | `transport`                        | TEXT            | Transportista                                 |
| RED10                 | `discount`                         | NUMERIC(19,4)   | Descuento                                     |
| IS_PRIVILEGIE         | `is_privileged`                    | BOOLEAN         | Cliente privilegiado                          |
| IMPCARTECLUB          | `club_card_fee`                    | NUMERIC(19,4)   | Importe tarjeta club                          |
| REDCARTECLUB          | `club_card_discount`               | NUMERIC(19,4)   | Descuento tarjeta club                        |
| IS_PESADO             | `is_shipped_by_supplier`           | BOOLEAN         | Envío por proveedor                           |
| IS_PESADO_PARCIAL     | `is_partially_shipped_by_supplier` | BOOLEAN         | Envío parcial proveedor                       |
| FOURNISSEUR           | `is_supplier`                      | BOOLEAN         | Proveedor                                     |
| IS_SUSTITUTIVO        | `is_substitute`                    | BOOLEAN         | Contiene sustitutivos                         |
| IS_SIN_ARTICULO       | `is_no_article`                    | BOOLEAN         | Sin artículo                                  |
| IMP_SINART            | `no_article_amount`                | NUMERIC(19,4)   | Importe sin artículo                          |
| IS_BAV                | `is_bav`                           | BOOLEAN         | Pedido BAV                                    |
| IMP_BAV               | `bav_amount`                       | NUMERIC(19,4)   | Importe BAV                                   |
| PEDIDO_BAV            | `bav_order`                        | TEXT            | Código pedido BAV                             |
| IMP_A_PAGAR           | `amount_due`                       | NUMERIC(19,4)   | Importe a pagar                               |
| NextAvailableNumber   | `next_available_number`            | TEXT            | Número siguiente disponible                   |
| IS_BAV_GENERADO       | `is_generated_bav`                 | BOOLEAN         | BAV generado automáticamente                  |
| IMP_BAV_GENERADO      | `generated_bav_amount`             | NUMERIC(19,4)   | Importe BAV generado                          |
| ANULADO               | `is_annulled`                      | BOOLEAN         | Pedido anulado                                |
| FECHA_ANULADO         | `annulled_at`                      | DATE            | **Fecha de anulación**                        |
| ANULADO_POR (id)      | `annulled_by_id`                   | BIGINT          | **FK a `users.user_id`**                      |
| ANULADO_POR (nombre)  | `annulled_by_name`                 | TEXT            | Nombre visible al anular                      |
| GRABADOR (id)         | `created_by_id`                    | BIGINT          | **FK a `users.user_id`**                      |
| GRABADOR (nombre)     | `created_by_name`                  | TEXT            | Nombre visible al crear                       |
| FECHA_GRABACION       | `created_at`                       | TIMESTAMP       | Fecha de creación                             |
| MODIFICADOR           | `updated_by`                      | TEXT            | Usuario que modificó                          |
| FECHA_MODIFICACION    | `updated_at`                      | TIMESTAMP       | Fecha de modificación                         |

---

### Relación con otras Tablas

* `brands` (`brand_id`), `order_sources` (`order_source_id`), `customers` (`customer_id`),
  `actions` (`action_id`), `action_categories` (`action_category_id`),
  `action_priority_types` (`action_priority_id`), `order_payments` (`payment_type_id`).
* **Usuarios**:
  * `created_by_id` → `users(user_id)` **ON DELETE RESTRICT**.
  * `annulled_by_id` → `users(user_id)` **ON DELETE RESTRICT**.
* Tablas hijas: `order_items`, `order_addresses`, `order_notes` (por `order_id`).

---

### Flujo General

`orders` es el encabezado del pedido. Centraliza datos de cliente, marca, acción y costes.
`order_items` detalla líneas; `order_payments` y `order_payment_schedules` el cobro;
`order_addresses` las direcciones; `order_notes` las notas.
El **origen del pedido** se normaliza a través de `order_sources` y se referencia con `order_source_id`.

---

### Ejemplo de Inserciones

```sql
INSERT INTO orders (
  site_id, order_datetime, order_reference, brand_id, order_source_id,
  customer_id, is_paid, created_by_id, created_by_name
)
SELECT
  1, CURRENT_TIMESTAMP, 'PO-2025-001', 3, os.order_source_id,
  101, FALSE, 1, 'Iván'
FROM order_sources os
WHERE os.site_id = 1 AND lower(os.source_name) = 'web';
```

---

### Índices recomendados

```sql
CREATE INDEX idx_orders_order_id        ON orders (order_id);
CREATE INDEX idx_orders_customer_id     ON orders (customer_id);
CREATE INDEX idx_orders_order_reference ON orders (site_id, order_reference);
CREATE INDEX idx_orders_site_status     ON orders (site_id, status);
CREATE INDEX idx_orders_site_source     ON orders (site_id, order_source_id);
```
