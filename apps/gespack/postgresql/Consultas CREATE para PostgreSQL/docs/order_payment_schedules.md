# order\_payment\_schedules (Plazos de Pago del Pedido)

## Índice

- [Cambios realizados](#cambios-realizados)
- [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
- [Relación con otras Tablas](#relación-con-otras-tablas)
- [Flujo General](#flujo-general)
- [Ejemplo de Inserciones](#ejemplo-de-inserciones)
- [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

- Tabla hija de `order_payments` para almacenar los plazos de pagos aplazados.
- Estructura multi-tenant (`site_id` siempre presente).
- Un registro por cada plazo/fracción de pago.
- Añadidos todos los campos de trazabilidad, cobro, cheque y auditoría.

---

### Detalle de Transformaciones por Campo

| Campo                        | Tipo                   | Comentario                             |
| ---------------------------- | ---------------------- | -------------------------------------- |
| order\_payment\_schedule\_id | BIGINT (PK)            | Clave primaria autonumérica            |
| site\_id                     | BIGINT                 | Cliente (multi-tenant), FK a sites     |
| order\_payments\_id          | BIGINT                 | Pago asociado, FK a order\_payments    |
| schedule\_number             | INT NOT NULL           | Número de plazo (1, 2, 3, 4...)        |
| amount                       | NUMERIC(19,4) NOT NULL | Importe de este plazo                  |
| due\_date                    | DATE                   | Fecha de vencimiento del plazo         |
| is_paid                      | BOOLEAN                | TRUE si el plazo está pagado           |
| paid\_date                   | DATE                   | Fecha de pago del plazo                |
| is_unpaid                    | BOOLEAN                | TRUE si el plazo ha resultado impagado |
| unpaid\_date                 | DATE                   | Fecha de impago                        |
| is_recovered                 | BOOLEAN                | TRUE si impago fue recuperado          |
| recovered\_date              | DATE                   | Fecha recuperación                     |
| cheque\_number               | TEXT                   | Nº de cheque del plazo, si aplica      |
| bank\_name                   | TEXT                   | Banco del cheque, si aplica            |
| created\_by                  | TEXT                   | Auditoría: usuario creador             |
| created\_at                  | TIMESTAMP              | Fecha de creación (por defecto actual) |
| modified\_by                 | TEXT                   | Usuario última modificación            |
| modified\_at                 | TIMESTAMP              | Fecha última modificación              |

---

### Relación con otras Tablas

* `site_id` → `sites(site_id)` (ON DELETE RESTRICT)
* `(site_id, order_payments_id)` → `order_payments(site_id, order_payments_id)` (ON DELETE CASCADE)

---

### Flujo General

Cada registro de esta tabla representa un plazo/fracción de un pago aplazado registrado en `order_payments`.
Por cada pago aplazado (`is_deferred = TRUE`), se insertan aquí tantos registros como indique `schedule_count` en la cabecera,
numerados por `schedule_number`.
Permite saber importe, estado, fecha, datos de cheque/banco y trazabilidad de cada plazo.

---

### Ejemplo de Inserciones

```sql
INSERT INTO order_payment_schedules (site_id, order_payments_id, schedule_number, amount, due_date, cheque_number, bank_name, created_by)
VALUES (1, 1001, 1, 50.00, '2024-11-01', 'CHQ-234', 'Banco Ejemplo', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_order_payment_schedules_site_payment ON order_payment_schedules (site_id, order_payments_id);
CREATE INDEX idx_order_payment_schedules_schedule_number ON order_payment_schedules (site_id, schedule_number);
```
