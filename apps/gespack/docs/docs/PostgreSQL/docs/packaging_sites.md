# packaging_sites (Asignación de Embalajes por Cliente)

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

* Relaciona embalajes con clientes (`sites`).
* Control de estado de asignación (`is_active`).

#### 2. Tipos de Datos:

* `int` → `BIGINT`
* `nvarchar` → `TEXT`
* `boolean` → `BOOLEAN`

#### 3. Claves e Integridad:

* Clave primaria: `packaging_site_id`
* Única: `site_id, packaging_id`
* Foreign Key: `site_id` y `packaging_id`

---

### Detalle de Transformaciones por Campo

| Campo original   | Campo nuevo         | Tipo PostgreSQL | Comentario                              |
| ---------------- | ------------------- | --------------- | --------------------------------------- |
| ID               | packaging_site_id   | BIGINT          | Clave primaria autonumérica             |
| SITE_ID          | site_id             | BIGINT          | Clave foránea a `sites`                 |
| PACKAGING_ID     | packaging_id        | BIGINT          | Clave foránea a `packaging`             |
| ASIGNADO_POR     | assigned_by         | TEXT            | Usuario que asigna el embalaje          |
| ASIGNADO_EN      | assigned_at         | TIMESTAMP       | Fecha de asignación                     |
| DESASIGNADO_POR  | unassigned_by       | TEXT            | Usuario que desasigna (puede ser NULL)  |
| DESASIGNADO_EN   | unassigned_at       | TIMESTAMP       | Fecha de desasignación (puede ser NULL) |
| ESTADO           | is_active           | BOOLEAN         | TRUE = asignado, FALSE = desasignado    |

---

### Relación con otras Tablas

* `sites`: clave foránea `site_id`
* `packaging`: clave foránea `packaging_id`

---

### Flujo General

Esta tabla sirve para asignar y llevar trazabilidad de los embalajes activos por cliente.
Permite controlar altas/bajas y consultar históricos por `is_active`.

---

### Ejemplo de Inserciones

```sql
INSERT INTO packaging_sites (site_id, packaging_id, assigned_by)
VALUES (1, 2, 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_packaging_sites_site_active ON packaging_sites (site_id, is_active);
CREATE INDEX idx_packaging_sites_packaging_active ON packaging_sites (packaging_id, is_active);
```
