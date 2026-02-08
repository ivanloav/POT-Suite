# Montant

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de transformaciones por campo](#detalle-de-transformaciones-por-campo)
* [Función de la tabla](#función-de-la-tabla)
* [Relaciones y claves foráneas](#relaciones-y-claves-foráneas)
* [Índices recomendados](#índices-recomendados)
* [Ejemplo de inserción](#ejemplo-de-inserción)

---

## Cambios realizados

* Añadido el campo `site_id` como referencia multi-tenant.
* Añadidos campos de auditoría (`created_by`, `created_at`, `modified_by`, `updated_at`).
* Clave primaria en `montant_id` (autonumérica).
* Clave única multitenant sobre (`site_id`, `range_from`, `range_to`) para evitar solapamiento de rangos por cliente.
* Tipos de datos adaptados a PostgreSQL.
* Índices por rangos y site para búsquedas rápidas.
* FK hacia `sites(site_id)`.

---

## Detalle de transformaciones por campo

| Campo original | Campo PostgreSQL | Tipo         | Comentario                                     |
| -------------- | ---------------- | ------------ | ---------------------------------------------- |
| ID             | montant\_id      | BIGINT       | Clave primaria autonumérica                    |
| (N/A)          | site\_id         | BIGINT       | ID del cliente/tenant, FK a `sites`            |
| DESDE          | range\_from      | DOUBLE PREC. | Límite inferior del rango                      |
| HASTA          | range\_to        | DOUBLE PREC. | Límite superior del rango                      |
| MONTANT        | amount           | DOUBLE PREC. | Importe/monto asociado al rango                |
| (N/A)          | created\_by      | TEXT         | Auditoría: usuario creador                     |
| (N/A)          | created\_at      | TIMESTAMP    | Auditoría: fecha creación (por defecto actual) |
| (N/A)          | modified\_by     | TEXT         | Auditoría: usuario última modificación         |
| (N/A)          | modified\_at     | TIMESTAMP    | Auditoría: fecha última modificación           |

---

## Función de la tabla

La tabla `montant` define tramos o rangos monetarios por cliente (site) y el importe asociado a cada rango. Es útil para tarifas escaladas, límites por tramo, reglas de facturación dinámica, etc., siempre segmentadas por site.

---

## Relaciones y claves foráneas

* `site_id` es clave foránea a la tabla `sites(site_id)` (ON DELETE RESTRICT).

---

## Índices recomendados

```sql
CREATE INDEX idx_montant_site_from ON montant (site_id, range_from);
CREATE INDEX idx_montant_site_to ON montant (site_id, range_to);
```

---

## Ejemplo de inserción

```sql
INSERT INTO montant (site_id, range_from, range_to, amount, created_by)
VALUES (1, 0, 1000, 25.00, 'admin');
```
