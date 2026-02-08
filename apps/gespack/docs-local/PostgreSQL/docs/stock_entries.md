# stock\_entries (Entradas de Stock)

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
* Añadida FK `(site_id, product_id)` a `products` para trazabilidad.
* Todos los campos de texto originales convertidos a tipo apropiado.
* PK autonumérico técnico (`stock_entry_id`).
* Índices para búsquedas rápidas por producto y proveedor.
* Auditoría estándar (`created_by`, `created_at`, etc.).

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo PostgreSQL      | Tipo          | Comentario                                  |
| ------------------- | --------------------- | ------------- | ------------------------------------------- |
| ID                  | stock\_entry\_id      | BIGINT        | Clave primaria autonumérica                 |
| (nuevo)             | site\_id              | BIGINT        | Cliente/tenant, multi-tenant                |
| (nuevo)             | product\_id           | BIGINT        | FK a `products`                             |
| REFERENCIA          | reference             | TEXT          | (Opcional) referencia duplicada si se desea |
| DESCRIPCION         | description           | TEXT          | Descripción del movimiento/entrada          |
| CANTIDAD            | quantity              | NUMERIC(19,4) | Cantidad de unidades entradas               |
| ALBARAN\_FACTURA    | invoice\_or\_delivery | TEXT          | Albarán o factura de la entrada             |
| PROVEEDOR           | supplier              | TEXT          | Proveedor                                   |
| FECHA\_ENTRADA      | entry\_date           | DATE          | Fecha de entrada                            |
| TRABAJADOR          | worker                | TEXT          | Operario o trabajador responsable           |
| TIPO\_ENTRADA       | entry\_type           | TEXT          | Motivo/Tipo de movimiento                   |
| CREADOR             | created\_by           | TEXT          | Usuario que registra                        |
| FECHA\_CREACION     | created\_at           | TIMESTAMP     | Fecha de creación del registro              |
| MODIFICADOR         | modified\_by          | TEXT          | Usuario que modifica                        |
| FECHA\_MODIFICACION | modified\_at          | TIMESTAMP     | Fecha de modificación                       |

---

### Relación con otras Tablas

* `site_id` → `sites(site_id)` (ON DELETE RESTRICT)
* `(site_id, product_id)` → `products(site_id, product_id)` (ON DELETE RESTRICT)

---

### Función de la tabla

Registra cada entrada o movimiento de stock de un producto, detallando proveedor, cantidad, operario, motivo y referencias de documento.
Permite trazabilidad completa del inventario por producto y cliente/site.

---

### Ejemplo de Inserción

```sql
INSERT INTO stock_entries (site_id, product_id, reference, description, quantity, invoice_or_delivery, supplier, entry_date, worker, entry_type, created_by)
VALUES (1, 2, 'PROD123', 'Entrada almacén central', 100, 'ALB-455', 'Proveedor S.A.', '2024-11-05', 'Luis García', 'compra', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_stock_entries_site_product ON stock_entries (site_id, product_id);
CREATE INDEX idx_stock_entries_site_supplier ON stock_entries (site_id, supplier);
```
