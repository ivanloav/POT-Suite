# Actions Priority Types (Tipos de Prioridad)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Restricciones e índices](#restricciones-e-índices)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla original: `actions_priority_types`.
- Se añadió `site_id` para soporte multicliente.
- Clave primaria: `action_priority_id` autonumérica.
- Clave única: `(site_id, priority_name)`.
- Incluye campos de auditoría.

---

## Definición de campos

| Campo              | Tipo            | Descripción                         |
|--------------------|-----------------|-------------------------------------|
| action_priority_id | BIGINT IDENTITY | Clave primaria técnica              |
| site_id            | BIGINT NOT NULL | Cliente                             |
| priority_name      | TEXT NOT NULL   | Nombre del tipo de prioridad        |
| created_by         | TEXT            | Usuario que crea                    |
| created_at         | TIMESTAMP       | Fecha creación                      |
| modified_by        | TEXT            | Usuario que modifica                |
| updated_at        | TIMESTAMP       | Fecha modificación                  |

---

## Restricciones e índices

- `PRIMARY KEY (action_priority_id)`
- `UNIQUE (site_id, priority_name)`

```sql
CREATE INDEX idx_actions_priority_types_site_name ON actions_priority_types (site_id, priority_name);
```

---

## Ejemplos de inserciones

```sql
INSERT INTO actions_priority_types (site_id, priority_name, created_by)
VALUES (1, 'NORMAL', 'admin'),
       (1, 'EXPRESS', 'admin');
```

---

## Ejemplos de consultas

```sql
SELECT * FROM actions_priority_types
WHERE site_id = 1 AND priority_name = 'EXPRESS';
```