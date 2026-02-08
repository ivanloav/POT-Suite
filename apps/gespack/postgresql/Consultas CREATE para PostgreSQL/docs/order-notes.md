# order_notes (Notas de Pedido)

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

* Tabla `order_notes` creada para registrar observaciones asociadas a pedidos.
* Contempla notas internas o externas, clasificadas con un campo booleano.

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `bit` → `BOOLEAN`
* `nvarchar` → `TEXT`

#### 3. Claves e Integridad:

* Clave primaria: `note_id`
* Foreign Key compuesta: `(site_id, order_id)` → `orders`

---

### Detalle de Transformaciones por Campo

| Campo original  | Campo nuevo      | Tipo PostgreSQL | Comentario                    |
| --------------- | ---------------- | --------------- | ----------------------------- |
| ID_NOTA         | note_id          | BIGINT          | Clave primaria autonumérica   |
| ID_SITE         | site_id          | BIGINT          | Cliente (sitio)               |
| ID_PEDIDO       | order_id         | BIGINT          | Clave foránea a `orders`      |
| REF_PEDIDO      | order_reference  | TEXT            | Referencia del pedido         |
| TEXTO_NOTA      | note_text        | TEXT            | Contenido de la nota          |
| ES_INTERNA      | is_internal      | BOOLEAN         | Marca si es interna o visible |
| CREADOR         | created_by       | VARCHAR(100)    | Usuario que crea la nota      |
| FECHA_CREACION  | created_at       | TIMESTAMP       | Fecha de creación             |

---

### Relación con otras Tablas

* `orders`: clave foránea compuesta `(site_id, order_id)` con `ON DELETE RESTRICT`

---

### Flujo General

Se utiliza para almacenar comentarios o incidencias asociadas a un pedido. El campo `is_internal` permite diferenciar si la nota debe mostrarse o mantenerse solo para uso interno del sistema.

---

### Ejemplo de Inserciones

```sql
INSERT INTO order_notes (site_id, order_id, order_reference, note_text, is_internal, created_by)
VALUES (1, 101, 'PO-001', 'Cliente solicita entrega por la tarde', TRUE, 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_order_notes_order_id ON order_notes (order_id);
```
