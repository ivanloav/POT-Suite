# customer_types (Tipos de Cliente)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones](#ejemplo-de-inserciones)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

#### 1. General:
* Catálogo auxiliar para clasificar clientes por tipología (Retail, Wholesale, VIP, …).
* `snake_case` y **multi‑tenant** mediante `site_id`.

#### 2. Tipos de Datos:
* `nvarchar` → `TEXT`
* `datetime` → `TIMESTAMP`
* `int` → `BIGINT`/`INTEGER` según campo

#### 3. Claves Primarias:
* `customer_type_id` como clave primaria autonumérica.
* `site_id` obligatorio para entorno multi‑cliente.

---

### Detalle de Transformaciones por Campo

| Campo original | Campo nuevo       | Tipo PostgreSQL | Comentario                                   |
| -------------- | ----------------- | --------------- | -------------------------------------------- |
| ID             | customer_type_id  | BIGINT          | Clave primaria autonumérica                  |
| SITE_ID        | site_id           | BIGINT          | Cliente/Site asociado                         |
| TYPE_CODE      | type_code         | INTEGER         | Código numérico de tipo (ej: 1=Retail)       |
| TYPE_NAME      | type_name         | TEXT            | Nombre del tipo (ej: VIP, Wholesale, etc.)   |
| DESCRIPTION    | description       | TEXT            | Descripción opcional                         |
| ACTIVO         | is_active         | BOOLEAN         | Estado activo/inactivo                       |
| CREADOR        | created_by        | BIGINT          | Usuario que crea el registro                 |
| FECHA_CREACION | created_at        | TIMESTAMP       | Fecha de creación                            |
| MODIFICADOR    | updated_by       | BIGINT          | Usuario que modifica                         |
| FECHA_MODIF.   | updated_at       | TIMESTAMP       | Fecha de modificación                        |

---

### Flujo General

Define las tipologías de cliente en cada `site`. `customers.customer_type_id` referencia este catálogo. Es habitual usar `type_code` para integraciones y `type_name` para UI.

---

### Ejemplo de Inserciones

```sql
INSERT INTO customer_types (site_id, type_code, type_name, description, created_by)
VALUES (1, 1, 'Retail', 'Cliente minorista estándar', 1001);

INSERT INTO customer_types (site_id, type_code, type_name, description, created_by)
VALUES (1, 2, 'Wholesale', 'Cliente mayorista con descuentos', 1001);
```

---

### Índices recomendados

```sql
-- Unicidad por sitio para código y nombre (case-insensitive en nombre)
CREATE UNIQUE INDEX uq_customer_types_site_code
  ON customer_types (site_id, type_code);

CREATE UNIQUE INDEX uq_customer_types_site_name_ci
  ON customer_types (site_id, lower(type_name));

-- Para FKs compuestas (si se usan):
ALTER TABLE customer_types
  ADD CONSTRAINT uq_customer_types_site_id_and_id UNIQUE (site_id, customer_type_id);

-- Apoyo
CREATE INDEX idx_customer_types_site_id     ON customer_types (site_id);
CREATE INDEX idx_customer_types_is_active   ON customer_types (site_id, is_active);
CREATE INDEX idx_customer_types_updated_at ON customer_types (site_id, updated_at);
```
