# Actions Category Costs (Costes por Categoría y Prioridad)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Relaciones](#relaciones)
- [Restricciones e índices](#restricciones-e-índices)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla original: `actions_category_costs`.
- Usada para definir costes por combinación categoría + prioridad.
- Añadido `site_id` para entorno multicliente.
- Clave primaria técnica: `category_cost_id`.
- Restricción `UNIQUE (site_id, action_category_id, action_priority_id)`.
- Incluye campos de auditoría.

---

## Definición de campos

| Campo               | Tipo            | Descripción                                  |
|---------------------|-----------------|----------------------------------------------|
| category_cost_id    | BIGINT IDENTITY | Clave primaria técnica                       |
| site_id             | BIGINT NOT NULL | Cliente                                      |
| action_category_id  | BIGINT NOT NULL | Referencia a la categoría                    |
| action_priority_id  | BIGINT NOT NULL | Referencia al tipo de prioridad              |
| shipping_cost       | NUMERIC(19,4)   | Coste de envío                               |
| mandatory_fee       | NUMERIC(19,4)   | Tarifas adicionales                          |
| created_by          | TEXT            | Usuario que crea                             |
| created_at          | TIMESTAMP       | Fecha creación                               |
| updated_by         | TEXT            | Usuario que modifica                         |
| updated_at         | TIMESTAMP       | Fecha modificación                           |

---

## Relaciones

- `actions_categories` → (site_id, action_category_id)
- `actions_priority_types` → (site_id, action_priority_id)

---

## Restricciones e índices

- `PRIMARY KEY (category_cost_id)`
- `UNIQUE (site_id, action_category_id, action_priority_id)`

```sql
CREATE INDEX idx_actions_costs_site_cat_prio ON actions_category_costs (site_id, action_category_id, action_priority_id);
```

---

## Ejemplos de inserciones

```sql
INSERT INTO actions_category_costs (site_id, action_category_id, action_priority_id, shipping_cost, mandatory_fee, created_by)
VALUES (1, 1, 2, 10.00, 2.50, 'admin');
```

---

## Ejemplos de consultas

```sql
SELECT * FROM actions_category_costs
WHERE site_id = 1 AND action_priority_id = 2;
```