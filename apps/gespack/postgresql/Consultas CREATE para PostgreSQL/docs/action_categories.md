# Actions Categories (Categorías de Acciones)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Restricciones e índices](#restricciones-e-índices)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla original: `actions_categories`.
- Incluye `site_id` para entorno multicliente.
- Clave primaria técnica: `action_category_id`.
- Clave única compuesta por `site_id + category_name`.
- Se añaden campos de auditoría.

---

## Definición de campos

| Campo              | Tipo            | Descripción                         |
|--------------------|-----------------|-------------------------------------|
| action_category_id | BIGINT IDENTITY | Clave primaria técnica              |
| site_id            | BIGINT NOT NULL | Cliente                             |
| category_name      | TEXT NOT NULL   | Nombre de la categoría              |
| description        | TEXT            | Descripción de la categoría         |
| created_by         | TEXT            | Usuario que crea                    |
| created_at         | TIMESTAMP       | Fecha creación                      |
| modified_by        | TEXT            | Usuario que modifica                |
| updated_at        | TIMESTAMP       | Fecha modificación                  |

---

## Restricciones e índices

- `PRIMARY KEY (action_category_id)`
- `UNIQUE (site_id, category_name)`

```sql
CREATE INDEX idx_actions_categories_site_name ON actions_categories (site_id, category_name);
```

---

## Ejemplos de inserciones

```sql
INSERT INTO actions_categories (site_id, category_name, description, created_by)
VALUES (1, 'Promociones', 'Acciones promocionales para cliente final', 'admin');
```

---

## Ejemplos de consultas

```sql
SELECT * FROM actions_categories
WHERE site_id = 1 AND category_name ILIKE '%promo%';
```