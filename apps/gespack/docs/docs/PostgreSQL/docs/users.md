# users (Usuarios de la Aplicación)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con otras Tablas](#relación-con-otras-tablas)
* [Función de la tabla](#función-de-la-tabla)
* [Ejemplo de Inserción](#ejemplo-de-inserción)
* [Índices recomendados](#índices-recomendados)
* [Notas de seguridad](#notas-de-seguridad)

---

### Cambios realizados

* **Se mantiene `site_id`** como **sitio principal opcional** del usuario (nullable).
* La pertenencia a varios sites se gestiona con la tabla intermedia **`user_site`** y se refleja en `users.total_site`.
* Flags booleanos para roles/estado: `is_customer`, `is_admin`, `is_active`, `is_cb`, `is_list`.
* `locale` con valor por defecto **`'es'`**.
* `send_daily_orders_report` para activar reporte diario por usuario.
* **Normalización de email** (lower/trim) en inserciones/actualizaciones.
* **Auditoría estándar**: `created_by`, `created_at`, `updated_by`, `updated_at`.
* Contraseña **siempre en hash** (bcrypt/argon2). **Nunca** texto plano.
* Eliminación de usuario **restringida** si está referenciado por otras tablas (p. ej., `orders.created_by_id`, `orders.annulled_by_id`).

---

### Detalle de Transformaciones por Campo

| Campo original  | Campo PostgreSQL           | Tipo      | Comentario                                       |
| --------------- | -------------------------- | --------- | ------------------------------------------------ |
| ID              | `user_id`                  | BIGINT    | Clave primaria autonumérica                      |
| (principal)     | `site_id`                  | BIGINT    | Site principal opcional (FK a `sites`)           |
| USER\_NAME      | `user_name`                | TEXT      | Nombre de usuario (único en sistema)             |
| USER\_PASSWORD  | `user_password`            | TEXT      | **Hash** seguro (bcrypt/argon2)                  |
| EMAIL           | `email`                    | TEXT      | Correo (se normaliza a minúsculas/trim)          |
| LOCALE          | `locale`                   | TEXT      | Idioma, por defecto `'es'`                       |
| IS\_CUSTOMER    | `is_customer`              | BOOLEAN   | Rol cliente                                      |
| IS\_ADMIN       | `is_admin`                 | BOOLEAN   | Rol administrador                                |
| ACTIVE          | `is_active`                | BOOLEAN   | Activo/inactivo                                  |
| IS\_CB          | `is_cb`                    | BOOLEAN   | Flag personalizado                               |
| IS\_LIST        | `is_list`                  | BOOLEAN   | Flag personalizado                               |
| (derivado)      | `total_site`               | BIGINT    | Nº de sites asignados (sincronizado por trigger) |
| (preferencia)   | `send_daily_orders_report` | BOOLEAN   | Enviar reporte diario de pedidos                 |
| CREADOR         | `created_by`               | TEXT      | Auditoría                                        |
| FECHA\_CREACION | `created_at`               | TIMESTAMP | Auditoría                                        |
| MODIFICADOR     | `updated_by`              | TEXT      | Auditoría                                        |
| FECHA\_MODIF    | `updated_at`              | TIMESTAMP | Auditoría                                        |

---

### Relación con otras Tablas

* **Muchos-a-muchos** con `sites` vía **`user_site`**.
* `users.total_site` se mantiene mediante triggers al insertar/actualizar/borrar en `user_site`.
* Otras tablas referencian a `users` (p. ej., `orders.created_by_id`, `orders.annulled_by_id`), **ON DELETE RESTRICT** para impedir borrar usuarios con actividad.

---

### Función de la tabla

Gestiona credenciales, preferencias y roles de cada usuario. Soporta multi-tenant: un usuario puede tener un **site principal** (`users.site_id`) y además pertenecer a **N sites** mediante `user_site`.

---

### Ejemplo de Inserción

```sql
INSERT INTO users (
  site_id, user_name, user_password, email,
  is_admin, is_active, locale, created_by
) VALUES (
  1, 'jlopez', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  'jlopez@parcelontime.es', TRUE, TRUE, 'es', 'admin'
);
```

---

### Índices recomendados

```sql
-- Unicidades
ALTER TABLE users ADD CONSTRAINT uq_users_email    UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (user_name);

-- Búsquedas frecuentes
CREATE INDEX idx_users_name       ON users (user_name);
CREATE INDEX idx_users_email_ci   ON users (lower(email));
CREATE INDEX idx_users_is_admin   ON users (is_admin);
CREATE INDEX idx_users_is_active  ON users (is_active);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_site_id    ON users (site_id);
```

---

### Notas de seguridad

* **Nunca** almacenar contraseñas en texto plano (usar bcrypt/argon2).
* No exponer `user_password` en respuestas de API ni logs.
* Usar cookies **HttpOnly** y **Secure** para el token.
* Limitar permisos por site mediante `user_site`.
