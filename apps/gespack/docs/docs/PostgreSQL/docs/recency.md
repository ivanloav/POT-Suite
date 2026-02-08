# recency (Rangos de Recencia)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con otras Tablas](#relación-con-otras-tablas)
* [Función de la tabla](#función-de-la-tabla)
* [Ejemplo de Inserción](#ejemplo-de-inserción)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

* Añadido campo `site_id` como referencia multi-tenant.
* Añadidos campos de auditoría estándar.
* Todos los campos `nvarchar` convertidos a `TEXT`.
* PK en `recency_id` autonumérico.
* UNIQUE `(site_id, recency_id)` para garantizar unicidad por cliente.
* Índice en `(site_id, recency_label)`.
* FK de `site_id` a `sites(site_id)` (ON DELETE RESTRICT).

---

### Detalle de Transformaciones por Campo

| Campo original | Campo PostgreSQL | Tipo      | Comentario                               |
| -------------- | ---------------- | --------- | ---------------------------------------- |
| ID             | recency\_id      | BIGINT    | Clave primaria autonumérica              |
| (nuevo)        | site\_id         | BIGINT    | Cliente/tenant, multi-tenant, FK a sites |
| DESDE          | range\_from      | TEXT      | Límite/rango inferior                    |
| HASTA          | range\_to        | TEXT      | Límite/rango superior                    |
| RECENCIA       | recency\_label   | TEXT      | Etiqueta, nombre o código del rango      |
| (nuevo)        | created\_by      | TEXT      | Auditoría                                |
| (nuevo)        | created\_at      | TIMESTAMP | Auditoría (fecha de creación)            |
| (nuevo)        | modified\_by     | TEXT      | Auditoría                                |
| (nuevo)        | modified\_at     | TIMESTAMP | Auditoría (fecha de modificación)        |

---

### Relación con otras Tablas

* `site_id` → `sites(site_id)` (ON DELETE RESTRICT)

---

### Función de la tabla

Almacena los rangos de recencia o antigüedad (por ejemplo, para segmentación RFM, campañas, reglas de negocio, etc.), permitiendo definir etiquetas o códigos y los límites de cada rango por cliente/site.

---

### Ejemplo de Inserción

```sql
INSERT INTO recency (site_id, range_from, range_to, recency_label, created_by)
VALUES (1, '0', '30', 'Muy reciente', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_recency_site_label ON recency (site_id, recency_label);
```
