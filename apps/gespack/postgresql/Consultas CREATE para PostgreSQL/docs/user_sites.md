# user\_sites (Relación Usuarios - Sites)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con otras Tablas](#relación-con-otras-tablas)
* [Función de la tabla](#función-de-la-tabla)
* [Ejemplo de Inserción](#ejemplo-de-inserción)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

* Añadida PK técnica (`user_site_id` autonumérico) además de la clave lógica compuesta (`user_id`, `site_id`).
* Modelo muchos-a-muchos para asociar usuarios a uno o varios sites/clientes.
* FKs a `users` y `sites`.
* Auditoría opcional (puedes añadir campos `created_by`, `created_at` si lo ves necesario en el futuro).

---

### Detalle de Transformaciones por Campo

| Campo          | Tipo   | Comentario                                 |
| -------------- | ------ | ------------------------------------------ |
| user\_site\_id | BIGINT | PK técnica autonumérica                    |
| user\_id       | BIGINT | FK a `users`, identifica el usuario        |
| site\_id       | BIGINT | FK a `sites`, identifica el cliente/tenant |

---

### Relación con otras Tablas

* `user_id` → `users(user_id)` (ON DELETE CASCADE)
* `site_id` → `sites(site_id)` (ON DELETE CASCADE)

---

### Función de la tabla

Permite asignar a cada usuario uno o varios sites (clientes/tenants), y viceversa. Esencial para entornos multi-tenant donde los permisos o el acceso están condicionados por la empresa o entorno seleccionado. El uso de una PK técnica facilita futuras ampliaciones (roles, fecha de alta, etc.).

---

### Ejemplo de Inserción

```sql
INSERT INTO user_sites (user_id, site_id) VALUES (42, 1);
-- Así el usuario 42 tiene acceso al site 1.
```

---

### Índices recomendados

```sql
CREATE UNIQUE INDEX idx_user_sites_user_site ON user_sites (user_id, site_id);
CREATE INDEX idx_user_sites_site ON user_sites (site_id);
```
