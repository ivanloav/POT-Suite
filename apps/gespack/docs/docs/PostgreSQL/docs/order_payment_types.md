
# order_payment_types (Catálogo de Tipos de Pago de Pedido)

## Índice

- [Cambios realizados](#cambios-realizados)
- [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
- [Relación con otras Tablas](#relación-con-otras-tablas)
- [Flujo General](#flujo-general)
- [Ejemplo de Inserciones](#ejemplo-de-inserciones)
- [Restricciones e Índices recomendados](#restricciones-e-índices-recomendados)

---

### Cambios realizados

#### 1. General:

* Tabla `order_payment_types` creada como catálogo de tipos de pago permitidos para pedidos.
* Permite definir tipos como efectivo, tarjeta, cheque, aplazado, etc., por sitio.

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `nvarchar` → `TEXT`

#### 3. Claves e Integridad:

* Clave primaria: `order_payment_type_id`
* Clave foránea: `site_id` → `sites`
* Clave única: combinación de `site_id` y `order_payment_type_id`

#### 4. Campos nuevos:

* `is_active` (BOOLEAN): indica si el tipo de pago está activo
* Campos de auditoría: `created_by`, `created_at`, `updated_by`, `updated_at`

---

### Detalle de Transformaciones por Campo

| Campo original         | Campo nuevo             | Tipo PostgreSQL | Comentario                                 |
| ---------------------- | ---------------------- | --------------- | ------------------------------------------ |
| ID                    | order_payment_type_id   | BIGINT          | Clave primaria autonumérica                |
| SITE_ID               | site_id                 | BIGINT          | Cliente (sitio), multi-tenant              |
| PAYMENT_TYPE          | payment_type            | TEXT            | Nombre del tipo de pago                    |
| DESCRIPTION           | description             | TEXT            | Descripción adicional                      |
| IS_ACTIVE (nuevo)     | is_active               | BOOLEAN         | TRUE si está activo                        |
| CREATED_BY (nuevo)    | created_by              | TEXT            | Usuario que crea el registro               |
| CREATED_AT (nuevo)    | created_at              | TIMESTAMP       | Fecha de creación                          |
| UPDATED_BY (nuevo)    | updated_by              | TEXT            | Usuario que modifica                       |
| UPDATED_AT (nuevo)    | updated_at              | TIMESTAMP       | Fecha de modificación                      |

---

### Relación con otras Tablas

* `sites`: clave foránea `site_id` con `ON DELETE RESTRICT`
* Relación hija: `order_payments` (campo `payment_type`)

---

### Flujo General

Esta tabla define los tipos de pago permitidos para cada sitio. Se utiliza como catálogo para validar y normalizar los métodos de pago en los pedidos (`order_payments`).

Permite activar/desactivar tipos de pago sin perder histórico, y auditar quién y cuándo se crearon o modificaron los registros.

---

### Ejemplo de Inserciones

```sql
-- Tipo de pago efectivo para el sitio 1
INSERT INTO order_payment_types (site_id, payment_type, description, created_by)
VALUES (1, 'VISA', 'Tarjeta de crédito', 1);

INSERT INTO order_payment_types (site_id, payment_type, description, created_by)
VALUES (1, 'CHEQUE', 'Cheque bancario', 1);

INSERT INTO order_payment_types (site_id, payment_type, description, created_by)
VALUES (1, 'EFECTIVO', 'Dinero en efectivo', 1);
```

---

### Restricciones e Índices recomendados

```sql
-- Definición de la tabla
DROP TABLE IF EXISTS order_payment_types CASCADE;

CREATE TABLE order_payment_types (
    order_payment_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    site_id BIGINT NOT NULL,
    payment_type TEXT NOT NULL,           -- efectivo, tarjeta, cheque, aplazado, etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (site_id, order_payment_type_id),
    FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE RESTRICT
);

-- Índice recomendado para búsquedas por tipo de pago en order_payments
DROP INDEX IF EXISTS idx_order_payments_payment_type CASCADE;
CREATE INDEX idx_order_payments_payment_type ON order_payments (site_id, payment_type);
```

---

### Notas

- El catálogo permite controlar y auditar los tipos de pago disponibles por sitio.
- El índice `idx_order_payments_payment_type` se crea sobre la tabla `order_payments` para optimizar búsquedas por sitio y tipo de pago.
