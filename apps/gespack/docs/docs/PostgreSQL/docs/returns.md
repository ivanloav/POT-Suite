# returns (Devoluciones)

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

* Tabla `returns` para registrar devoluciones de pedidos por cliente y referencia.
* Multi-sitio (`site_id`).

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `date` → `DATE`
* `nvarchar` → `TEXT`
* `timestamp` → `TIMESTAMP`

#### 3. Claves e Integridad:

* Clave primaria: `return_id`
* Foreign Key: `(site_id, customer_code)` → `customers`
* Foreign Key: `(site_id, order_reference)` → `orders`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo      | Tipo PostgreSQL | Comentario                         |
| ------------------- | ---------------- | --------------- | ---------------------------------- |
| ID                  | return_id        | BIGINT          | Clave primaria autonumérica        |
| SITE_ID             | site_id          | BIGINT          | Cliente (multi-sitio)              |
| PEDIDO              | order_reference  | TEXT            | Pedido asociado a la devolución    |
| FECHA               | return_date      | DATE            | Fecha de devolución                |
| ACCION              | action           | TEXT            | Acción realizada (motivo, proceso) |
| NUM_CLIENTE         | customer_code    | BIGINT          | Número de cliente                  |
| MARCADO             | marked           | TEXT            | Marcado de la devolución           |
| CREADO_POR          | created_by       | TEXT            | Usuario que crea el registro       |
| FECHA_CREACION      | created_at       | TIMESTAMP       | Fecha de creación                  |
| MODIFICADOR         | updated_by      | TEXT            | Usuario que modifica               |
| FECHA_MODIFICACION  | updated_at      | TIMESTAMP       | Fecha de modificación              |

---

### Relación con otras Tablas

* `customers`: clave foránea `(site_id, customer_code)`
* `orders`: clave foránea `(site_id, order_reference)`

---

### Flujo General

Cada registro documenta una devolución de pedido para un cliente concreto, detallando fecha, acción, motivo y trazabilidad.

---

### Ejemplo de Inserciones

```sql
INSERT INTO returns (site_id, order_reference, return_date, customer_code, action, created_by)
VALUES (1, 'PO-2024-001', '2024-06-30', 1001, 'Producto defectuoso', 'admin');
```

---

### Índices recomendados

```sql
DROP INDEX IF EXISTS idx_returns_site_customer_code CASCADE;
CREATE INDEX idx_returns_site_customer_code ON returns (site_id, customer_code);

DROP INDEX IF EXISTS idx_returns_site_order_reference CASCADE;
CREATE INDEX idx_returns_site_order_reference ON returns (site_id, order_reference);
```
