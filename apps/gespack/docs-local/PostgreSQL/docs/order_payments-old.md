# order_payments (Pagos del Pedido)

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

* Tabla `order_payments` creada para registrar los pagos realizados en un pedido.
* Admite diferentes métodos: efectivo, tarjeta y cheque.

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `money` → `NUMERIC(19,4)`
* `nvarchar` → `TEXT`

#### 3. Claves e Integridad:

* Clave primaria: `order_payments_id`
* Clave foránea: `(site_id, order_id)` → `orders`
* Clave foránea: `card_type_id` → `order_payments_card_types`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo         | Tipo PostgreSQL | Comentario                              |
| ------------------- | ------------------- | --------------- | --------------------------------------- |
| ID                  | order_payments_id   | BIGINT          | Clave primaria autonumérica             |
| SITE_ID             | site_id             | BIGINT          | Cliente (sitio)                         |
| ID_PEDIDO           | order_id            | BIGINT          | Pedido asociado                         |
| TIPO_PAGO           | payment_type        | TEXT            | Tipo de pago: efectivo, tarjeta, cheque |
| TITULAR             | holder_name         | TEXT            | Titular del cheque o tarjeta            |
| IMPORTE             | amount              | NUMERIC(19,4)   | Importe total del pago                  |
| BANCO               | bank_name           | TEXT            | Nombre del banco (si es cheque)         |
| NUM_CHEQUE          | cheque_number       | TEXT            | Número del cheque                       |
| VISA                | card_type_id        | INT             | Tipo de tarjeta (relación con catálogo) |
| NUM_TARJETA         | card_number         | BIGINT          | Número de la tarjeta                    |
| FECHA_CADUCIDAD     | expiration_date     | VARCHAR(5)      | Fecha de caducidad tarjeta (MM/YY)      |
| CREADOR             | created_by          | TEXT            | Usuario que registra el pago            |
| FECHA_CREACION      | created_at          | TIMESTAMP       | Fecha de creación del pago              |
| MODIFICADOR         | modified_by         | TEXT            | Usuario que modifica                    |
| FECHA_MODIFICACION  | updated_at         | TIMESTAMP       | Fecha de modificación                   |

---

### Relación con otras Tablas

* `orders`: clave foránea `(site_id, order_id)` con `ON DELETE CASCADE`
* `order_payments_card_types`: relación por `card_type_id`

---

### Flujo General

Esta tabla guarda los métodos y detalles de pago aplicados a un pedido. Un pedido puede tener uno o más registros de pago.
Admite efectivo, tarjeta (con tipo y número) y cheque (con banco y número).

---

### Ejemplo de Inserciones

```sql
INSERT INTO order_payments (site_id, order_id, payment_type, holder_name, amount)
VALUES (1, 101, 'tarjeta', 'Ana Gómez', 49.95);
```

---

### Índices recomendados

```sql
CREATE INDEX idx_order_payments_order_id ON order_payments (site_id, order_id);
CREATE INDEX idx_order_payments_type ON order_payments (payment_type);
CREATE INDEX idx_order_payments_card_type ON order_payments (card_type_id);
```
