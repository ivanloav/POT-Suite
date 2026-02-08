# product\_unavailable (Productos No Disponibles)

## Índice

- [Cambios realizados](#cambios-realizados)
- [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
- [Relación con otras Tablas](#relación-con-otras-tablas)
- [Función de la tabla](#función-de-la-tabla)
- [Ejemplo de Inserción](#ejemplo-de-inserción)
- [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

- Conversión del nombre a inglés y formato snake\_case.
- Añadido campo `site_id` multi-tenant y FK a `sites`.
- Todos los campos de texto convertidos a `TEXT`.
- PK autonumérico técnico (`unavailable_id`).
- UNIQUE `(site_id, unavailable_id)` para garantizar unicidad.
- Índice en `(site_id, reference)`.
- Campos de auditoría estándar (`created_by`, `created_at`, etc.).

---

### Detalle de Transformaciones por Campo

| Campo original | Campo PostgreSQL | Tipo      | Comentario                         |
| -------------- | ---------------- | --------- | ---------------------------------- |
| ID             | unavailable\_id  | BIGINT    | Clave primaria autonumérica        |
| (nuevo)        | site\_id         | BIGINT    | Cliente/tenant, multi-tenant       |
| REFERENCIA     | reference        | TEXT      | Referencia del producto            |
| CATALOGO       | catalog          | TEXT      | Código de catálogo                 |
| DESCRIPCION    | description      | TEXT      | Descripción                        |
| CANT\_MAX      | max\_quantity    | INT       | Cantidad máxima no disponible      |
| CANT\_USED     | used\_quantity   | INT       | Cantidad ya asignada/no disponible |
| DATE\_CREATION | created\_at      | TIMESTAMP | Fecha de creación                  |
| DATE\_MAX      | expires\_at      | TIMESTAMP | Fecha límite/no disponibilidad     |
| CREATED\_BY    | created\_by      | TEXT      | Usuario creador                    |
| DATE\_MODIF    | modified\_at     | TIMESTAMP | Fecha de modificación              |
| MODIF\_BY      | modified\_by     | TEXT      | Usuario modificador                |
| ACTIVE         | is\_active       | BOOLEAN   | TRUE=activo, FALSE=inactivo        |

---

### Relación con otras Tablas

- `site_id` → `sites(site_id)` (ON DELETE RESTRICT)

---

### Función de la tabla

Almacena los productos o referencias temporalmente no disponibles para un cliente/site,
con cantidad máxima y seguimiento de uso/asignaciones, fechas de vigencia y trazabilidad completa.

---

### Ejemplo de Inserción

```sql
INSERT INTO products_unavailable (site_id, reference, catalog, description, max_quantity, used_quantity, expires_at, created_by)
VALUES (1, 'ABC123', 'CAT2024', 'Producto agotado', 100, 0, '2024-12-31', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_products_unavailable_site_reference ON products_unavailable (site_id, reference);
```
