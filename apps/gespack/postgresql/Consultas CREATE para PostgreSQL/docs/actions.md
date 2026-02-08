# Actions (Acciones)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Relaciones con otras tablas](#relaciones-con-otras-tablas)
- [Restricciones e índices](#restricciones-e-índices)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla original: `Acciones` de SQL Server.
- Renombrada como `actions`.
- Separada en tablas auxiliares:
  - `actions_categories`
  - `actions_priority_types`
  - `actions_category_costs`
- Se agregó `site_id` para entorno multi-cliente.
- Se añadieron campos de auditoría.
- Los campos `nvarchar` se migraron a `TEXT`, `datetime` a `TIMESTAMP`, `money` a `NUMERIC(19,4)`.

---

## Definición de campos

| Campo                | Tipo                    | Descripción                              |
|----------------------|-------------------------|-------------------------------------------|
| action_id            | BIGINT IDENTITY         | Clave primaria técnica                    |
| site_id              | BIGINT NOT NULL         | ID del cliente (multicliente)             |
| action_name          | TEXT NOT NULL           | Nombre de la acción                       |
| description          | TEXT                    | Descripción                               |
| launch_date          | TIMESTAMP NOT NULL      | Fecha de lanzamiento                      |
| deposit_date         | TIMESTAMP NOT NULL      | Fecha de depósito                         |
| brand_id             | BIGINT NOT NULL         | Relación con tabla `brands`               |
| print_run            | INT                     | Tirada de impresiones                     |
| is_active            | BOOLEAN DEFAULT TRUE    | Estado de la acción                       |
| catalog_code         | TEXT                    | Código catálogo                           |
| catalog_lot          | TEXT                    | Lote de catálogo                          |
| catalog_description  | TEXT                    | Descripción de catálogo                   |
| action_category_id   | BIGINT                  | Relación con `actions_categories`         |
| created_by           | TEXT                    | Auditoría: usuario creador                |
| created_at           | TIMESTAMP               | Auditoría: fecha creación                 |
| modified_by          | TEXT                    | Auditoría: usuario modificación           |
| updated_at          | TIMESTAMP               | Auditoría: fecha modificación             |

---

## Relaciones con otras tablas

- `actions_categories` → Categoría asignada (`action_category_id`)
- `actions_priority_types` → Tipos de prioridad en `actions_category_costs`
- `actions_category_costs` → Relación compuesta con `action_category_id` y `action_priority_id`
- `brands` → Referencia a marca (`brand_id`)

---

## Restricciones e índices

- `PRIMARY KEY (action_id)`
- `UNIQUE (site_id, action_name)`

### Índices recomendados
```sql
CREATE INDEX idx_actions_site_name ON actions (site_id, action_name);
CREATE INDEX idx_actions_site_category ON actions (site_id, action_category_id);
```

---

## Ejemplos de inserciones

```sql
-- Insertar categoría
INSERT INTO actions_categories (site_id, category_name, description, created_by)
VALUES (1, 'Envío Estándar', 'Acciones de envío estándar', 'admin');

-- Insertar tipo de prioridad
INSERT INTO actions_priority_types (site_id, priority_name, created_by)
VALUES (1, 'NORMAL', 'admin');

-- Insertar coste
INSERT INTO actions_category_costs (site_id, action_category_id, action_priority_id, shipping_cost, mandatory_fee, created_by)
VALUES (1, 1, 1, 5.00, 1.50, 'admin');

-- Insertar acción
INSERT INTO actions (site_id, action_name, description, launch_date, deposit_date, action_category_id, brand_id, created_by)
VALUES (1, 'Primavera 2024', 'Campaña de Primavera', '2024-03-01', '2024-03-15', 1, 2, 'admin');
```

---

## Ejemplos de consultas

### Acciones por categoría
```sql
SELECT a.action_name, c.category_name
FROM actions a
JOIN actions_categories c ON a.action_category_id = c.action_category_id
WHERE a.site_id = 1;
```

### Costos por prioridad
```sql
SELECT c.category_name, p.priority_name, ac.shipping_cost
FROM actions_category_costs ac
JOIN actions_categories c ON ac.action_category_id = c.action_category_id
JOIN actions_priority_types p ON ac.action_priority_id = p.action_priority_id
WHERE ac.site_id = 1;
```
