# sites (Clientes / Sites)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones](#ejemplo-de-inserciones)
* [Índices recomendados](#índices-recomendados)
* [Triggers](#triggers)

---

### Cambios realizados

#### 1. General:

* Tabla `sites` para registrar los clientes, tenants o entornos multiempresa.
* Restricción y unicidad sobre `site_name`.

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `nvarchar` → `TEXT`
* `boolean` → `BOOLEAN`
* `timestamp` → `TIMESTAMP`

#### 3. Claves e Integridad:

* Clave primaria: `site_id`
* UNIQUE: `site_name`
* Índice: `site_name`
* Trigger para actualización automática de timestamp

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo       | Tipo PostgreSQL | Comentario                                   |
| ------------------- | ----------------- | --------------- | -------------------------------------------- |
| ID_SITE             | site_id           | BIGINT          | Clave primaria autonumérica                  |
| NOMBRE              | site_name         | TEXT            | Nombre único y restringido (1-15 mayúsculas) |
| DESCRIPCION         | site_description  | TEXT            | Descripción del cliente/tenant               |
| CONTACTO            | contact_info      | TEXT            | Información de contacto                      |
| ACTIVO              | is_active         | BOOLEAN         | ¿Site activo?                                |
| FECHA_CREACION      | created_at        | TIMESTAMP       | Fecha de creación                            |
| FECHA_MODIFICACION  | updated_at        | TIMESTAMP       | Fecha de última modificación (auto)          |

---

### Flujo General

La tabla `sites` centraliza la gestión de todos los entornos y clientes de la plataforma. Permite saber en qué site se está trabajando en cada operación.

---

### Ejemplo de Inserciones

```sql
INSERT INTO sites (site_name, site_description, contact_info, is_active)
VALUES ('CLIENTE1', 'Cliente principal', 'info@cliente1.com', TRUE);
```

---

### Índices recomendados

```sql
CREATE UNIQUE INDEX idx_sites_site_name ON sites (site_name);
```

---

### Triggers

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_timestamp
BEFORE UPDATE ON sites
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```
