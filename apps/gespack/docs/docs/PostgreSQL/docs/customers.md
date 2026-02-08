# customers (Clientes)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones y Consultas](#ejemplo-de-inserciones-y-consultas)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

#### 1. General:

* Tabla normalizada usando `snake_case` y entorno **multi‑tenant** con `site_id`.
* Clave técnica `customer_id` (IDENTITY) + unicidad por `(site_id, customer_code)`.
* Inclusión de **`customer_type_id`** para clasificar clientes (FK a `customer_types`).
* Mantenimiento de tipologías auxiliares: **RNVP** (`rnvp_type_id`) y **Marcado** (`marked_type_id`).

#### 2. Tipos de Datos:

* `nvarchar` → `TEXT`
* `datetime` → `TIMESTAMP`
* `int` → `BIGINT` / `INT` según el campo

#### 3. Claves Primarias y Foreign Keys:

* Clave primaria: `customer_id` (IDENTITY)
* Foreign keys:
  * `(site_id, rnvp_type_id)` → `customer_rnvp_types(site_id, rnvp_type_id)`
  * `(site_id, marked_type_id)` → `customer_marked_types(site_id, marked_type_id)`
  * `(site_id, customer_type_id)` → `customer_types(site_id, customer_type_id)`

> **Nota**: Asegúrate de que `customer_types` tenga `UNIQUE(site_id, customer_type_id)` si usas FK compuesta.

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo              | Tipo PostgreSQL | Comentario                             |
| ------------------- | ------------------------ | --------------- | -------------------------------------- |
| NUMERO_DE_CLIENT    | customer_id              | BIGINT          | ID técnico generado automáticamente    |
| ID_SITE             | site_id                  | BIGINT          | Identificador del site                 |
| NUMERO_DE_CLIENT    | customer_code            | BIGINT          | Código del cliente (único por site)    |
| SEXO                | customer_gender          | TEXT            | Género (dato original general)         |
| NOMBRE              | customer_first_name      | TEXT            | Nombre del cliente                     |
| APELLIDO            | customer_last_name       | TEXT            | Apellido del cliente                   |
| SEXO                | billing_gender           | TEXT            | Género (facturación)                   |
| NOM                 | billing_first_name       | TEXT            | Nombre (facturación)                   |
| APE                 | billing_last_name        | TEXT            | Apellido (facturación)                 |
| DIR1                | billing_address_line1    | TEXT            | Dirección línea 1 (facturación)        |
| DIR2                | billing_address_line2    | TEXT            | Dirección línea 2 (facturación)        |
| DIR3                | billing_address_line3    | TEXT            | Dirección línea 3 (facturación)        |
| DIR4                | billing_address_line4    | TEXT            | Dirección línea 4 (facturación)        |
| CP                  | billing_address_cp       | TEXT            | Código postal (facturación)            |
| POBLACION           | billing_address_city     | TEXT            | Ciudad (facturación)                   |
| CAMPO NUEVO         | billing_address_country  | TEXT            | País (facturación)                     |
| PORTABLE            | billing_mobile_phone     | TEXT            | Teléfono móvil (facturación)           |
| SEXO                | shipping_gender          | TEXT            | Género (envío)                         |
| NOM                 | shipping_first_name      | TEXT            | Nombre (envío)                         |
| APE                 | shipping_last_name       | TEXT            | Apellido (envío)                       |
| DIR1                | shipping_address_line1   | TEXT            | Dirección línea 1 (envío)              |
| DIR2                | shipping_address_line2   | TEXT            | Dirección línea 2 (envío)              |
| DIR3                | shipping_address_line3   | TEXT            | Dirección línea 3 (envío)              |
| DIR4                | shipping_address_line4   | TEXT            | Dirección línea 4 (envío)              |
| CP                  | shipping_address_cp      | TEXT            | Código postal (envío)                  |
| POBLACION           | shipping_address_city    | TEXT            | Ciudad (envío)                         |
| CAMPO NUEVO         | shipping_address_country | TEXT            | País (envío)                           |
| PORTABLE            | shipping_mobile_phone    | TEXT            | Teléfono móvil (envío)                 |
| TEL                 | phone                    | TEXT            | Teléfono fijo                          |
| TIPO_DE_CLIENTE     | customer_type_id         | BIGINT          | **FK a `customer_types`**              |
| FECHA_NACIMIENTO    | birth_date               | DATE            | Fecha de nacimiento                    |
| P1                  | npai                     | TEXT            | Indicador NPAI                         |
| Q1                  | rfm                      | TEXT            | Segmentación RFM                       |
| R1                  | credit_risk              | TEXT            | Riesgo crediticio                      |
| S1                  | source_origin            | TEXT            | Origen fuente (dato legado S1)         |
| TUTELADO            | is_under_guardianship    | BOOLEAN         | ¿Tutelado? (default FALSE)             |
| DECEDE              | is_deceased              | BOOLEAN         | ¿Fallecido? (default FALSE)            |
| ROBINSON            | do_not_contact           | BOOLEAN         | ¿En lista Robinson? (default FALSE)    |
| RNVP                | rnvp_type_id             | INT             | Tipo RNVP (relación externa)           |
| MARCADO             | marked_type_id           | INT             | Tipo de marcado (relación externa)     |
| EMAIL               | email                    | TEXT            | Correo electrónico                     |
| PRIVILEGIE          | privileged               | BOOLEAN         | ¿Privilegiado? (default FALSE)         |
| DATE_PRIVILEGIE     | privileged_date          | DATE            | Fecha de privilegio                    |
| CREADOR             | created_by               | TEXT            | Usuario que crea el registro           |
| FECHA_CREACION      | created_at               | TIMESTAMP       | Fecha de creación                      |
| MODIFICADOR         | updated_by              | TEXT            | Usuario que modifica el registro       |
| FECHA_MODIFICACION  | updated_at              | TIMESTAMP       | Fecha de modificación                  |

---

### Relación con Tablas Auxiliares

* `customer_types`: **clasificación de cliente** (`customer_type_id`)  
* `customer_marked_types`: tipología de **marcado** (`marked_type_id`)  
* `customer_rnvp_types`: tipología **RNVP** (`rnvp_type_id`)

---

### Flujo General

Cada cliente se asocia a un `site_id`. Puede clasificarse mediante `customer_type_id` (p. ej., Retail/Wholesale/VIP), además de las tipologías RNVP y Marcado. Los datos de facturación y envío conviven en el mismo registro por simplicidad operativa.

---

### Ejemplo de Inserciones y Consultas

```sql
-- Inserción simple con tipo de cliente
INSERT INTO customers (
  site_id, customer_code, customer_first_name, customer_last_name, customer_type_id
) VALUES (1, 10001, 'María', 'López', 1);

-- Consulta por site y apellido
SELECT *
FROM customers
WHERE site_id = 1 AND customer_last_name ILIKE 'lópez';

-- Búsqueda por tipo de cliente (JOIN catálogo)
SELECT c.customer_id, c.customer_code, ct.type_name
FROM customers c
JOIN customer_types ct
  ON ct.site_id = c.site_id AND ct.customer_type_id = c.customer_type_id
WHERE c.site_id = 1;
```

---

### Índices recomendados

```sql
CREATE INDEX idx_customers_code        ON customers (site_id, customer_code);
CREATE INDEX idx_customers_last_name   ON customers (customer_last_name);
CREATE INDEX idx_customers_site_ctype  ON customers (site_id, customer_type_id);
```

---
