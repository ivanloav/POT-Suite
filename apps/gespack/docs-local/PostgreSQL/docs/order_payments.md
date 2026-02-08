# order\_payments (Pagos del Pedido) - También se introducen los pagos aplazados

## Índice

- [Cambios realizados](#cambios-realizados)
- [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
- [Relación con otras Tablas](#relación-con-otras-tablas)
- [Flujo General](#flujo-general)
- [Ejemplo de Inserciones](#ejemplo-de-inserciones)
- [Restricciones e Índices recomendados](#restricciones-e-índices-recomendados)
- [Ampliar número de plazos (schedule_count)](#ampliar-número-de-plazos-schedule_count)

---

### Cambios realizados

#### 1. General:

* Tabla `order_payments` creada para registrar todos los pagos de un pedido.
* Permite múltiples métodos de pago: efectivo, tarjeta, cheque y pagos aplazados/fraccionados.

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `money` → `NUMERIC(19,4)`
* `nvarchar` → `TEXT`

#### 3. Claves e Integridad:

* Clave primaria: `order_payments_id`
* Clave foránea: `(site_id, order_id)` → `orders`
* Clave foránea: `card_type_id` → `order_payments_card_types`
* Relación hija: `order_payment_schedules` (para plazos de pagos aplazados)

#### 4. Campos nuevos (pagos aplazados y estado):

* Añadido campo `is_deferred` (BOOLEAN): TRUE si el pago es aplazado
* Añadido campo `schedule_count` (INT): número de plazos/fracciones, CHECK (1–4), default 1
* Añadidos campos de control de impagos, recuperaciones e incobrables:

  * `is_unpaid`, `unpaid_amount`, `unpaid_date`
  * `is_recovered`, `recovered_amount`, `recovery_date`
  * `is_uncollectible`, `uncollectible_amount`, `uncollectible_date`
* Añadido campo `security_code` (INT) para código verificación de tarjeta

---

### Detalle de Transformaciones por Campo

| Campo original                | Campo nuevo           | Tipo PostgreSQL | Comentario                                        |
| ----------------------------- | --------------------- | --------------- | ------------------------------------------------- |
| ID                            | order\_payments\_id   | BIGINT          | Clave primaria autonumérica                       |
| SITE\_ID                      | site\_id              | BIGINT          | Cliente (sitio), multi-tenant                     |
| ID\_PEDIDO                    | order\_id             | BIGINT          | Pedido asociado                                   |
| TIPO\_PAGO                    | payment\_type         | TEXT            | Tipo de pago: efectivo, tarjeta, cheque, aplazado |
| is\_deferred (nuevo)          | is\_deferred          | BOOLEAN         | TRUE si el pago es aplazado                       |
| schedule\_count (nuevo)       | schedule\_count       | INT             | Nº de plazos (CHECK 1-4, default 1)               |
| TITULAR                       | holder\_name          | TEXT            | Titular del cheque o tarjeta                      |
| IMPORTE                       | amount                | NUMERIC(19,4)   | Importe total del pago                            |
| BANCO                         | bank\_name            | TEXT            | Nombre del banco (si es cheque)                   |
| NUM\_CHEQUE                   | cheque\_number        | TEXT            | Número del cheque                                 |
| VISA                          | card\_type\_id        | INT             | Tipo de tarjeta (relación con catálogo)           |
| NUM\_TARJETA                  | card\_number          | BIGINT          | Número de la tarjeta                              |
| FECHA\_CADUCIDAD              | expiration\_date      | VARCHAR(5)      | Fecha de caducidad tarjeta (MM/YY)                |
| SECURITY\_CODE (nuevo)        | security\_code        | INT             | Código de verificación tarjeta                    |
| is\_unpaid (nuevo)            | is\_unpaid            | BOOLEAN         | TRUE si el pago está impagado                     |
| unpaid\_amount (nuevo)        | unpaid\_amount        | NUMERIC(19,4)   | Importe impagado                                  |
| unpaid\_date (nuevo)          | unpaid\_date          | DATE            | Fecha de impago                                   |
| is\_recovered (nuevo)         | is\_recovered         | BOOLEAN         | TRUE si el impago ha sido recuperado              |
| recovered\_amount (nuevo)     | recovered\_amount     | NUMERIC(19,4)   | Importe recuperado                                |
| recovery\_date (nuevo)        | recovery\_date        | DATE            | Fecha recuperación                                |
| is\_uncollectible (nuevo)     | is\_uncollectible     | BOOLEAN         | TRUE si el impago es incobrable                   |
| uncollectible\_amount (nuevo) | uncollectible\_amount | NUMERIC(19,4)   | Importe incobrable                                |
| uncollectible\_date (nuevo)   | uncollectible\_date   | DATE            | Fecha de declaración incobrable                   |
| CREADOR                       | created\_by           | TEXT            | Usuario que registra el pago                      |
| FECHA\_CREACION               | created\_at           | TIMESTAMP       | Fecha de creación del pago                        |
| MODIFICADOR                   | modified\_by          | TEXT            | Usuario que modifica                              |
| FECHA\_MODIFICACION           | modified\_at          | TIMESTAMP       | Fecha de modificación                             |

---

### Relación con otras Tablas

* `orders`: clave foránea `(site_id, order_id)` con `ON DELETE CASCADE`
* `order_payments_card_types`: relación por `card_type_id`
* Tabla hija: `order_payment_schedules` (detalle de plazos de pagos aplazados)

---

### Flujo General

Esta tabla guarda los métodos y detalles de pago aplicados a un pedido. Un pedido puede tener uno o más registros de pago, y cada pago puede ser **normal o aplazado** (`is_deferred`).

Si es aplazado, el campo `schedule_count` define el número de plazos/fracciones (entre 1 y 4) y los detalles de cada plazo se gestionan en la tabla hija `order_payment_schedules`.

Incluye control del estado del pago, impagos, recuperaciones e incobrables para máxima trazabilidad y reporting financiero.

---

### Ejemplo de Inserciones

```sql
-- Pago normal
INSERT INTO order_payments (site_id, order_id, payment_type, holder_name, amount)
VALUES (1, 101, 'tarjeta', 'Ana Gómez', 49.95);

-- Pago aplazado en 3 plazos
INSERT INTO order_payments (site_id, order_id, payment_type, is_deferred, schedule_count, holder_name, amount)
VALUES (1, 102, 'aplazado', TRUE, 3, 'Juan Pérez', 300.00);
```

---

### Restricciones e Índices recomendados

```sql
-- Restricción sobre número de plazos
schedule_count INT NOT NULL DEFAULT 1 CHECK (schedule_count >= 1 AND schedule_count <= 4)

-- Índices
CREATE INDEX idx_order_payments_order_id ON order_payments (site_id, order_id);
CREATE INDEX idx_order_payments_type ON order_payments (payment_type);
CREATE INDEX idx_order_payments_card_type ON order_payments (card_type_id);
CREATE INDEX idx_order_payments_deferred ON order_payments (site_id, is_deferred);
```

---

### Ampliar número de plazos (schedule_count)

Si en el futuro necesitas permitir más de 4 plazos para pagos aplazados, puedes modificar la restricción con:
```sql
ALTER TABLE order_payments
DROP CONSTRAINT IF EXISTS order_payments_schedule_count_check,
ADD CONSTRAINT order_payments_schedule_count_check CHECK (schedule_count >= 1 AND schedule_count <= 8);
```