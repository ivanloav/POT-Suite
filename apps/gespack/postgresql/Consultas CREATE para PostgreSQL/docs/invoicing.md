# Invoicing (Facturación)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Relaciones con otras tablas](#relaciones-con-otras-tablas)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla convertida desde `Facturacion` de SQL Server.
- Nombre estandarizado como `invoicing`.
- Se usaron claves técnicas (`invoicing_id`) y `site_id` como base multicliente.
- Se añadieron campos de auditoría.
- Claves foráneas hacia `customers`.
- Todos los campos están en `snake_case` y adaptados a PostgreSQL.
- Se añadió una restricción `UNIQUE (site_id, invoice_number)` para evitar duplicidad funcional por cliente.

---

## Definición de campos

| Campo                | Tipo                  | Descripción                                    |
|----------------------|-----------------------|------------------------------------------------|
| invoicing_id         | BIGINT IDENTITY       | Clave primaria técnica                         |
| site_id              | BIGINT NOT NULL       | Cliente (sitio)                                |
| invoicing_date       | TIMESTAMP             | Fecha de facturación                           |
| brand                | TEXT                  | Marca                                          |
| invoice_number       | TEXT NOT NULL         | Nº de factura                                  |
| customer_code        | TEXT                  | Código del cliente                             |
| first_name           | TEXT                  | Nombre del cliente                             |
| last_name            | TEXT                  | Apellido del cliente                           |
| order_reference      | TEXT                  | Referencia del pedido                          |
| priority_cost        | NUMERIC(19,4)         | Coste de prioridad                             |
| transport_cost       | NUMERIC(19,4)         | Coste de transporte                            |
| total_transport      | NUMERIC(19,4)         | Coste total de transporte                      |
| colissimo            | NUMERIC(19,4)         | Coste colissimo                                |
| bi1, bi2             | NUMERIC(19,4)         | Base imponible 1 y 2                           |
| tva1, tva2           | NUMERIC(19,4)         | IVA 1 y 2                                      |
| total                | NUMERIC(19,4)         | Importe total                                  |
| status               | TEXT                  | Estado de la factura                           |
| is_unpaid            | BOOLEAN DEFAULT FALSE | Marcado como impagado                          |
| unpaid_amount        | TEXT                  | Importe impagado                               |
| unpaid_date          | TEXT                  | Fecha de impago                                |
| is_recovered         | BOOLEAN DEFAULT FALSE | Indica si ha sido recobrado                    |
| recovered_amount     | TEXT                  | Importe recobrado                              |
| recovered_date       | TEXT                  | Fecha de recobro                               |
| is_uncollectible     | BOOLEAN DEFAULT FALSE | Incobrable                                     |
| uncollectible_amount | TEXT                  | Importe incobrable                             |
| uncollectible_date   | TEXT                  | Fecha incobrable                               |
| is_commission_paid   | BOOLEAN DEFAULT FALSE | Comisión pagada                                |
| mocall_invoice       | TEXT                  | Nº factura Mocall                              |
| commission           | TEXT                  | Importe de la comisión                         |
| worker               | TEXT                  | Operador                                       |
| invoice_date         | TIMESTAMP             | Fecha factura                                  |
| created_by           | TEXT                  | Auditoría: creador                             |
| created_at           | TIMESTAMP             | Fecha de creación                              |
| modified_by          | TEXT                  | Auditoría: modificador                         |
| updated_at          | TIMESTAMP             | Fecha de modificación                          |

**Restricciones adicionales:**
- `UNIQUE (site_id, invoice_number)`
- `UNIQUE (site_id, invoice_id)`

---

## Relaciones con otras tablas

- `customers`: `(site_id, customer_code)` → `customers(site_id, customer_code)`

---

## Ejemplos de inserciones

```sql
INSERT INTO invoicing (site_id, invoice_number, customer_code, order_reference, total, created_by)
VALUES (1, 'INV2024-001', 'CLI001', 'ORD12345', 79.95, 'admin');

---

## Ejemplos de consultas

### Ver facturas por cliente
```sql
SELECT * FROM invoicing
WHERE site_id = 1 AND customer_code = 'CLI001';
```

### Ver facturas impagadas
```sql
SELECT invoice_number, total, unpaid_amount
FROM invoicing
WHERE site_id = 1 AND is_unpaid = TRUE;
```