# product_substitutes (Sustituciones de Productos)

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

* Tabla `product_substitutes` para controlar sustituciones permitidas entre productos, multi-tenant por `site_id`.
* Control de cantidad máxima y usada, fechas y activación.

#### 2. Tipos de Datos:

* `int` → `BIGINT` / `INT`
* `nvarchar` → `TEXT`
* `timestamp` → `TIMESTAMP`
* `boolean` → `BOOLEAN`

#### 3. Claves e Integridad:

* Clave primaria: `substitute_id`
* UNIQUE (site_id, substitute_id)
* UNIQUE (site_id, ref_start, ref_end)

---

### Detalle de Transformaciones por Campo

| Campo original | Campo nuevo    | Tipo PostgreSQL | Comentario                               |
| -------------- | -------------- | --------------- | ---------------------------------------- |
| ID_SUBSTITUTO  | substitute_id  | BIGINT          | Clave primaria autonumérica              |
| SITE_ID        | site_id        | BIGINT          | Sitio (multi-tenant)                     |
| REF_INICIO     | ref_start      | TEXT            | Referencia de producto origen            |
| CAT_INICIO     | cat_start      | TEXT            | Catálogo producto origen                 |
| DESC_INICIO    | desc_start     | TEXT            | Descripción producto origen              |
| REF_FIN        | ref_end        | TEXT            | Referencia de producto destino/sustituto |
| CAT_FIN        | cat_end        | TEXT            | Catálogo producto destino                |
| DESC_FIN       | desc_end       | TEXT            | Descripción producto destino             |
| CANT_MAX       | max_quantity   | INT             | Cantidad máxima sustituible              |
| CANT_USED      | used_quantity  | INT             | Cantidad ya sustituida                   |
| DATE_CREATION  | created_at     | TIMESTAMP       | Fecha de creación                        |
| DATE_MAX       | expires_at     | TIMESTAMP       | Fecha máxima de validez                  |
| CREATED_BY     | created_by     | TEXT            | Usuario que crea el registro             |
| DATE_MODIF     | updated_at    | TIMESTAMP       | Fecha de última modificación             |
| MODIF_BY       | updated_by    | TEXT            | Usuario que modifica                     |
| ACTIVE         | is_active      | BOOLEAN         | ¿Sustitución activa?                     |

---

### Relación con otras Tablas

* `products`: relación lógica por `ref_start` y `ref_end`
* Multi-sitio por `site_id`

---

### Flujo General

Registra qué productos pueden sustituirse entre sí y en qué cantidades máximas y fechas. Útil para recálculos de stock y picking automático.

---

### Ejemplo de Inserciones

```sql
INSERT INTO product_substitutes (site_id, ref_start, ref_end, max_quantity, created_by)
VALUES (1, 'PRD001', 'PRD002', 20, 'admin');
```

---

### Índices recomendados

```sql
DROP INDEX IF EXISTS idx_product_substitutes_site_ref_start CASCADE;
CREATE INDEX idx_product_substitutes_site_ref_start ON product_substitutes (site_id, ref_start);

DROP INDEX IF EXISTS idx_product_substitutes_site_ref_end CASCADE;
CREATE INDEX idx_product_substitutes_site_ref_end ON product_substitutes (site_id, ref_end);
```
