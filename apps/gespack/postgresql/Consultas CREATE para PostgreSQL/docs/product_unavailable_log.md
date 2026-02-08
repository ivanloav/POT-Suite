# products\_unavailable\_log (Histórico de Productos No Disponibles)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con otras Tablas](#relación-con-otras-tablas)
* [Función de la tabla](#función-de-la-tabla)
* [Ejemplo de Inserción](#ejemplo-de-inserción)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

* Conversión del nombre a inglés y formato snake\_case.
* Añadido campo `site_id` multi-tenant y FK a `sites`.
* PK autonumérico técnico (`unavailable_log_id`).
* Índices para búsquedas rápidas por pedido y referencia.
* Auditoría mínima (`created_by`, `created_at`).

---

### Detalle de Transformaciones por Campo

| Campo original | Campo PostgreSQL     | Tipo      | Comentario                       |
| -------------- | -------------------- | --------- | -------------------------------- |
| ID             | unavailable\_log\_id | BIGINT    | Clave primaria autonumérica      |
| (nuevo)        | site\_id             | BIGINT    | Cliente/tenant, multi-tenant     |
| PEDIDO         | order\_reference     | TEXT      | Pedido donde se detecta la falta |
| REFERENCIA     | reference            | TEXT      | Referencia de producto           |
| LINEA\_PEDIDO  | order\_line          | INT       | Línea del pedido                 |
| CANT           | quantity             | INT       | Cantidad                         |
| DATE\_CREATION | created\_at          | TIMESTAMP | Fecha de creación del registro   |
| CREATED\_BY    | created\_by          | TEXT      | Usuario que crea el registro     |

---

### Relación con otras Tablas

* `site_id` → `sites(site_id)` (ON DELETE RESTRICT)

---

### Función de la tabla

Almacena el histórico de registros de productos no disponibles asociados a pedidos,
con detalle de pedido, referencia, línea y cantidad, para trazabilidad, control y auditoría.

---

### Ejemplo de Inserción

```sql
INSERT INTO products_unavailable_log (site_id, order_reference, reference, order_line, quantity, created_by)
VALUES (1, 'PED2024-001', 'PROD-X', 2, 5, 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_products_unavailable_log_site_order ON products_unavailable_log (site_id, order_reference);
CREATE INDEX idx_products_unavailable_log_site_reference ON products_unavailable_log (site_id, reference);
```
