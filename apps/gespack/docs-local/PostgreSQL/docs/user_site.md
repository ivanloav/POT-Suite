# user\_site (Relación Usuarios - Sites)

## Índice

* [Cambios realizados](#cambios-realizados-1)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo-1)
* [Relación con otras Tablas](#relación-con-otras-tablas-1)
* [Función de la tabla](#función-de-la-tabla-1)
* [Ejemplo de Inserción](#ejemplo-de-inserción-1)
* [Índices recomendados](#índices-recomendados-1)

---

### Cambios realizados

* PK técnica `user_site_id` y **clave única lógica** `(user_id, site_id)`.
* FK a `users(user_id)` **ON DELETE CASCADE** (limpia asignaciones si el usuario se elimina manualmente).
* `site_id` como **identificador externo** (si existe tabla `sites`, se recomienda FK `REFERENCES sites(site_id)`).
* Triggers asociados en `users`/`user_site` para **sincronizar `users.total_site`**.

---

### Detalle de Transformaciones por Campo

| Campo          | Tipo      | Comentario                                   |
| -------------- | --------- | -------------------------------------------- |
| `user_site_id` | BIGINT    | PK técnica autonumérica                      |
| `user_id`      | BIGINT    | FK a `users(user_id)`                        |
| `site_id`      | BIGINT    | Identificador del site/cliente (FK opcional) |
| `created_at`   | TIMESTAMP | Auditoría (fecha de creación)                |

---

### Relación con otras Tablas

* `user_id` → `users(user_id)` (**ON DELETE CASCADE**).
* Si gestionas `sites` en la misma BD: `site_id` → `sites(site_id)` (**ON DELETE RESTRICT** recomendado).

---

### Función de la tabla

Asigna usuarios a uno o varios **sites** (clientes/tenants). La unicidad `(user_id, site_id)` evita duplicados. Los triggers actualizan `users.total_site` automáticamente.

---

### Ejemplo de Inserción

```sql
INSERT INTO user_site (user_id, site_id) VALUES (42, 1);
```

---

### Índices recomendados

```sql
-- Unicidad de la relación
CREATE UNIQUE INDEX idx_user_site_user_site ON user_site (user_id, site_id);

-- Búsquedas típicas
CREATE INDEX idx_user_site_user ON user_site (user_id);
CREATE INDEX idx_user_site_site ON user_site (site_id);
```
