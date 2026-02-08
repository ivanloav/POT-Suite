# Invoicing Refunds (Abonos de Facturación)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Relaciones con otras tablas](#relaciones-con-otras-tablas)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla convertida desde `Facturacion_Abonos`.
- Renombrada como `invoicing_refunds` para coherencia en inglés.
- Incluye `site_id`, claves técnicas y campos de auditoría.
- Conectada con `customers` vía `site_id` + `customer_code`.
- Todos los campos adaptados a PostgreSQL y estandarizados en `snake_case`.
- Se añadió una restricción `UNIQUE (site_id, refund_invoice_number)` para evitar duplicidad de abonos por cliente.

---

## Definición de campos

| Campo                  | Tipo                  | Descripción                                |
|------------------------|-----------------------|---------------------------------------------|
| refund_id              | BIGINT IDENTITY       | Clave primaria técnica                      |
| site_id                | BIGINT NOT NULL       | Cliente                                     |
| invoice_date           | BIGINT NOT NULL       | ID de la factura a abonar                   |
| refund_date            | TIMESTAMP             | Fecha del abono                             |
| invoice_date           | TIMESTAMP             | Fecha de factura original                   |
| brand                  | TEXT                  | Marca                                       |
| refund_invoice_number  | TEXT NOT NULL         | Nº de factura de abono                      |
| customer_code          | TEXT                  | Código del cliente                          |
| first_name             | TEXT                  | Nombre del cliente                          |
| last_name              | TEXT                  | Apellido del cliente                        |
| order_reference        | TEXT                  | Pedido asociado                             |
| priority_cost          | NUMERIC(19,4)         | Coste de prioridad                          |
| transport_cost         | NUMERIC(19,4)         | Coste de transporte                         |
| total_transport        | NUMERIC(19,4)         | Transporte total                            |
| colissimo              | NUMERIC(19,4)         | Coste Colissimo                             |
| bi1, bi2               | NUMERIC(19,4)         | Base imponible 1 y 2                        |
| tva1, tva2             | NUMERIC(19,4)         | IVA 1 y 2                                   |
| total                  | NUMERIC(19,4)         | Total del abono                             |
| status                 | TEXT                  | Estado del abono                            |
| worker                 | TEXT                  | Responsable de facturación                  |
| related_invoice        | TEXT                  | Nº factura original a la que se abona       |
| created_by             | TEXT                  | Auditoría: usuario que crea                 |
| created_at             | TIMESTAMP             | Fecha de creación                           |
| modified_by            | TEXT                  | Usuario que modifica                        |
| updated_at            | TIMESTAMP             | Fecha de modificación                       |

**Restricciones adicionales:**
- `UNIQUE (site_id, refund_invoice_number)`
- `UNIQUE (site_id, refund_id)`

---

## Relaciones con otras tablas

- `customers`: `(site_id, customer_code)` → `customers(site_id, customer_code)`
- `invoicing`: `(site_id, invoice_id)` → `invoicing(site_id, invoice_id)`

---

## Ejemplos de inserciones

```sql
INSERT INTO invoicing_refunds (site_id, refund_invoice_number, customer_code, order_reference, total, created_by)
VALUES (1, 'ABN2024-001', 'CLI001', 'ORD12345', 39.95, 'admin');
```

---

## Ejemplos de consultas

### Ver abonos por cliente
```sql
SELECT * FROM invoicing_refunds
WHERE site_id = 1 AND customer_code = 'CLI001';
```

### Ver abonos por factura original
```sql
SELECT * FROM invoicing_refunds
WHERE site_id = 1 AND related_invoice = 'INV2024-001';
```
