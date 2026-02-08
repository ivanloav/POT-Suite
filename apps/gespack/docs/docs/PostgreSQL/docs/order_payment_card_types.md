# order_payments_card_types (Tipos de Tarjeta de Pago)

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

* Tabla auxiliar `order_payments_card_types` que contiene los posibles tipos de tarjeta (Visa, Mastercard, etc.).
* Se usa como catálogo en `order_payments`.

#### 2. Tipos de Datos:

* `nvarchar` → `TEXT`
* `datetime` → `TIMESTAMP`
* `int` → `BIGINT`

#### 3. Claves e Integridad:

* Clave primaria: `card_type_id`
* Nombre único: `card_type_name`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo      | Tipo PostgreSQL | Comentario                         |
| ------------------- | ---------------- | --------------- | ---------------------------------- |
| ID_TIPO_TARJETA     | card_type_id     | BIGINT          | Clave primaria autonumérica        |
| NOMBRE_TIPO         | card_type_name   | TEXT            | Nombre del tipo de tarjeta (único) |
| CREADOR             | created_by       | TEXT            | Usuario que registra el tipo       |
| FECHA_CREACION      | created_at       | TIMESTAMP       | Fecha de creación                  |
| MODIFICADOR         | updated_by      | TEXT            | Usuario que modifica               |
| FECHA_MODIFICACION  | updated_at      | TIMESTAMP       | Fecha de modificación              |

---

### Relación con otras Tablas

* `order_payments`: relación por `card_type_id`

---

### Flujo General

Este catálogo sirve para validar y asociar tipos de tarjeta permitidos en pagos. Se vincula a `order_payments` por `card_type_id`.

---

### Ejemplo de Inserciones

```sql
INSERT INTO order_payments_card_types (card_type_name, created_by)
VALUES ('VISA', 'admin');
```

---

### Índices recomendados

```sql
CREATE UNIQUE INDEX idx_card_types_name ON order_payments_card_types (card_type_name);
```
