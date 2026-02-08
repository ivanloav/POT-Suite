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

* Eliminado `site_id` como campo directo (la pertenencia a sites se gestiona con tabla intermedia `user_sites`).
* Flags booleanos para roles y estados.
* Guardar siempre el **hash** de la contraseña (no texto plano).
* Auditoría estándar.

---

### Detalle de Transformaciones por Campo

| Campo original  | Campo PostgreSQL | Tipo      | Comentario                                  |
| --------------- | ---------------- | --------- | ------------------------------------------- |
| ID              | user\_id         | BIGINT    | Clave primaria autonumérica                 |
| USER\_NAME      | user\_name       | TEXT      | Nombre de usuario (único en sistema)        |
| USER\_PASSWORD  | user\_password   | TEXT      | Hash seguro de la contraseña                |
| EMAIL           | email            | TEXT      | Correo electrónico                          |
| IS\_CUSTOMER    | is\_customer     | BOOLEAN   | Usuario cliente (rol específico)            |
| IS\_ADMIN       | is\_admin        | BOOLEAN   | Administrador del sistema                   |
| ACTIVE          | is\_active       | BOOLEAN   | Estado activo/inactivo                      |
| IS\_CB          | is\_cb           | BOOLEAN   | Flag personalizado                          |
| IS\_LIST        | is\_list         | BOOLEAN   | Flag personalizado                          |
| BD\_CUSTOMER    | bd\_customer     | TEXT      | Identificador externo de cliente (opcional) |
| CREADOR         | created\_by      | TEXT      | Auditoría                                   |
| FECHA\_CREACION | created\_at      | TIMESTAMP | Auditoría (fecha de creación)               |
| MODIFICADOR     | modified\_by     | TEXT      | Auditoría                                   |
| FECHA\_MODIF    | modified\_at     | TIMESTAMP | Auditoría (fecha de modificación)           |

---

### Relación con otras Tablas

* Relación muchos-a-muchos con `sites` a través de la tabla `user_sites`.

---

### Función de la tabla

Guarda la información principal y los permisos de cada usuario del sistema,
permitiendo gestionar usuarios globales, asignables a uno o varios sites/clientes
mediante la tabla intermedia `user_sites`.
Este diseño permite roles flexibles y gestión profesional multi-tenant.

---

### Ejemplo de Inserción

```sql
INSERT INTO users (user_name, user_password, email, is_admin, is_active, created_by)
VALUES ('jlopez', '$2a$10$xxxxxx', 'jlopez@pot.es', TRUE, TRUE, 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_users_name ON users (user_name);
CREATE INDEX idx_users_email ON users (email);
```

---

### Notas de seguridad

* **No guardes nunca contraseñas en texto plano.** Usa siempre hash seguro (bcrypt, Argon2, etc.).
* Si usas autenticación externa (LDAP, OAuth...), el campo de contraseña puede quedar vacío o marcado como externo.
* Cifra siempre las comunicaciones y protege el acceso a esta tabla.
