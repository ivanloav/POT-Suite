# order_payment_type_fields (Campos Personalizados por Tipo de Pago)

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

* Tabla `order_payment_type_fields` creada para definir los campos personalizados requeridos por cada tipo de pago.
* Permite configurar, por tipo de pago, los campos que debe rellenar el usuario (ej: número de cheque, fecha, etc).

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `nvarchar` → `TEXT`

#### 3. Claves e Integridad:

* Clave primaria: `field_id`
* Clave foránea: `order_payment_type_id` → `order_payment_types`


#### 4. Campos nuevos:

* `is_required` (BOOLEAN): indica si el campo es obligatorio
* `field_order` (INT): orden de visualización del campo
* `created_by` (TEXT): usuario que crea el registro
* `created_at` (TIMESTAMP): fecha de creación
* `updated_by` (TEXT): usuario que modifica
* `updated_at` (TIMESTAMP): fecha de modificación

---

### Detalle de Transformaciones por Campo

| Campo original         | Campo nuevo             | Tipo PostgreSQL | Comentario                                 |
| ---------------------- | ---------------------- | --------------- | ------------------------------------------ |
| ID                    | field_id                | BIGINT          | Clave primaria autonumérica                |
| ORDER_PAYMENT_TYPE_ID | order_payment_type_id   | BIGINT          | Relación con tipo de pago                  |
| FIELD_NAME            | field_name              | TEXT            | Nombre interno del campo                   |
| FIELD_TYPE            | field_type              | TEXT            | Tipo de input (text, number, date, etc)    |
| IS_REQUIRED (nuevo)   | is_required             | BOOLEAN         | TRUE si es obligatorio                     |
| FIELD_ORDER (nuevo)   | field_order             | INT             | Orden de visualización                     |
| CREATED_BY (nuevo)    | created_by              | TEXT            | Usuario que crea el registro               |
| CREATED_AT (nuevo)    | created_at              | TIMESTAMP       | Fecha de creación                          |
| UPDATED_BY (nuevo)    | updated_by              | TEXT            | Usuario que modifica                       |
| UPDATED_AT (nuevo)    | updated_at              | TIMESTAMP       | Fecha de modificación                      |

---

### Relación con otras Tablas

* `order_payment_types`: clave foránea `order_payment_type_id` con `ON DELETE CASCADE`

---

### Flujo General

Esta tabla permite definir, para cada tipo de pago, los campos adicionales que debe rellenar el usuario al registrar un pago. Por ejemplo, para cheques se puede requerir el número y la fecha, para tarjeta el número y el código de seguridad, etc.

Permite personalizar la experiencia de captura de pagos y validar que se ingresen los datos necesarios según el método seleccionado.

---

### Ejemplo de Inserciones

```sql
-- TARJETA
INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (1, 'titularTarjeta', 'text', false, 1, 'admin');

INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (1, 'numTarjeta', 'text', false, 1, 'admin');

INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (1, 'caducidadTarjeta', 'text', false, 1, 'admin');

INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (1, 'codVerificacion', 'text', false, 1, 'admin');

INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (1, 'importeTarjeta', 'text', false, 1, 'admin');

-- CHEQUE
INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (2, 'titularCheque', 'text', false, 1, 'admin');

INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (2, 'bancoCheque', 'text', false, 1, 'admin');

INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (2, 'numCheque', 'text', false, 1, 'admin');

INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (2, 'importeCheque', 'text', false, 1, 'admin');

--EFECTIVO
INSERT INTO order_payment_type_fields (order_payment_type_id, field_name, field_type, is_required, field_order, created_by)
VALUES (3, 'importeEfectivo', 'text', false, 1, 'admin');
```

---

### Restricciones e Índices recomendados

```sql
-- Definición de la tabla
DROP TABLE IF EXISTS order_payment_type_fields;

CREATE TABLE order_payment_type_fields (
    field_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_payment_type_id BIGINT NOT NULL,
    field_name TEXT NOT NULL,      -- nombre interno (ej: numeroCheque)
    field_type TEXT NOT NULL,      -- tipo de input (text, number, date, etc)
    is_required BOOLEAN DEFAULT FALSE,
    field_order INT DEFAULT 0,     -- para el orden de los campos
    created_by TEXT,                                                                -- CREADOR
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                                 -- FECHA_CREACION
    updated_by TEXT,                                                               -- MODIFICADOR
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                                -- FECHA_MODIFICACION

    FOREIGN KEY (order_payment_type_id) REFERENCES order_payment_types(order_payment_type_id) ON DELETE CASCADE
);

-- Índice recomendado para búsquedas por tipo de pago y orden
CREATE INDEX idx_payment_type_fields_type_order ON order_payment_type_fields (order_payment_type_id, field_order);
```

---

### Notas

- Permite definir y validar dinámicamente los campos requeridos para cada tipo de pago.
- El índice `idx_payment_type_fields_type_order` optimiza la obtención de los campos en el orden correcto para cada tipo de pago.
