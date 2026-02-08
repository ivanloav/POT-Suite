# return_items (Líneas de Devolución)

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

* Tabla `return_items` para detallar cada producto y cantidad devuelta en una devolución.
* Relacionada con `returns` vía `return_id`.

#### 2. Tipos de Datos:

* `int` → `BIGINT` / `INT`
* `nvarchar` → `TEXT`
* `timestamp` → `TIMESTAMP`

#### 3. Claves e Integridad:

* Clave primaria: `return_item_id`
* Foreign Key: `return_id` → `returns`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo      | Tipo PostgreSQL | Comentario                   |
| ------------------- | ---------------- | --------------- | ---------------------------- |
| ID                  | return_item_id   | BIGINT          | Clave primaria autonumérica  |
| RETURN_ID           | return_id        | BIGINT          | Clave foránea a returns      |
| REFERENCIA          | product_ref      | TEXT            | Referencia del producto      |
| CANTIDAD            | quantity         | INT             | Cantidad devuelta            |
| MOTIVO              | reason           | TEXT            | Motivo de la devolución      |
| CREADO_POR          | created_by       | TEXT            | Usuario que crea el registro |
| FECHA_CREACION      | created_at       | TIMESTAMP       | Fecha de creación            |
| MODIFICADOR         | updated_by      | TEXT            | Usuario que modifica         |
| FECHA_MODIFICACION  | updated_at      | TIMESTAMP       | Fecha de modificación        |

---

### Relación con otras Tablas

* `returns`: clave foránea `return_id` con `ON DELETE CASCADE`

---

### Flujo General

Cada registro representa una línea devuelta de un pedido (producto + cantidad + motivo), ligada a la devolución principal.

---

### Ejemplo de Inserciones

```sql
INSERT INTO return_items (return_id, product_ref, quantity, reason, created_by)
VALUES (10, 'PRD-001', 2, 'Defecto en el producto', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_return_items_return_id ON return_items (return_id);
CREATE INDEX idx_return_items_product_ref ON return_items (product_ref);
```
