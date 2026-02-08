# correspondence (Correspondencia)

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

* Tabla `correspondence` actualizada para registrar envíos vinculados a clientes tanto por `customer_id` como por `customer_code`.
* Uso estandarizado de `snake_case`.

#### 2. Tipos de Datos:

* `nvarchar` → `TEXT`
* `date` → `DATE`
* `int` → `BIGINT`

#### 3. Claves e Índices:

* Clave primaria técnica: `correspondence_id`
* Claves únicas por combinación de `site_id` con `correspondence_id`, `customer_id`, y `customer_code`
* Foreign keys explícitas hacia `customers`

---

### Detalle de Transformaciones por Campo

| Campo original | Campo nuevo        | Tipo PostgreSQL | Comentario                        |
| -------------- | ------------------ | --------------- | --------------------------------- |
| (autogenerado) | correspondence_id  | BIGINT          | ID técnico autonumérico           |
| Cliente        | site_id            | BIGINT          | Cliente relacionado (multitenant) |
| ID_CLIENTE     | customer_id        | BIGINT          | Identificador del cliente         |
| NUM_CLIENTE    | customer_code      | TEXT            | Código del cliente                |
| PEDIDO         | order_reference    | TEXT            | Referencia del pedido             |
| FECHA          | sent_date          | DATE            | Fecha de envío de la carta        |
| TIPO_CARTA     | letter_type        | TEXT            | Tipo de carta enviada             |

---

### Relación con otras Tablas

* `customers`: doble relación referencial por (`site_id`, `customer_id`) y (`site_id`, `customer_code`)

---

### Flujo General

Esta tabla almacena correspondencia enviada (cartas, comunicaciones postales o digitales) a clientes, enlazada mediante su ID o código.

Puede filtrarse por pedido, tipo de carta o fecha de envío.

---

### Ejemplo de Inserciones

```sql
INSERT INTO correspondence (site_id, customer_id, customer_code, order_reference, sent_date, letter_type)
VALUES (1, 101, 'C1001', 'PO-2024-788', '2024-07-15', 'Bienvenida');
```

---

### Índices recomendados

```sql
-- Unicidad por cliente y fecha
CREATE UNIQUE INDEX idx_correspondence_site_date ON correspondence (site_id, customer_code, sent_date);

-- Índices auxiliares
CREATE INDEX idx_correspondence_customer_id ON correspondence (site_id, customer_id);
CREATE INDEX idx_correspondence_customer_code ON correspondence (site_id, customer_code);
CREATE INDEX idx_correspondence_order_reference ON correspondence (site_id, order_reference);
```
