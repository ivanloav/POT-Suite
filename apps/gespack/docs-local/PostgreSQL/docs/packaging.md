# packaging (Tipos de Embalaje)

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

* Tabla `packaging` para definir los tipos de embalaje posibles.
* `packaging_type` es único.

#### 2. Tipos de Datos:

* `nvarchar` → `TEXT`
* `numeric` → `NUMERIC(10,2)`
* `int` → `BIGINT`

#### 3. Claves e Integridad:

* Clave primaria: `packaging_id`
* Único: `packaging_type`

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo     | Tipo PostgreSQL | Comentario                  |
| ------------------- | --------------- | --------------- | --------------------------- |
| ID_EMBALAJE         | packaging_id    | BIGINT          | Clave primaria autonumérica |
| TIPO                | packaging_type  | TEXT            | Tipo de embalaje único      |
| NOMBRE              | packaging_name  | TEXT            | Nombre del embalaje         |
| PESO                | weight          | NUMERIC(10,2)   | Peso del embalaje           |
| DIMENSION           | dimension       | TEXT            | Dimensiones                 |
| CREADOR             | created_by      | TEXT            | Usuario que crea            |
| FECHA_CREACION      | created_at      | TIMESTAMP       | Fecha de creación           |
| MODIFICADOR         | modified_by     | TEXT            | Usuario que modifica        |
| FECHA_MODIFICACION  | updated_at     | TIMESTAMP       | Fecha de modificación       |

---

### Relación con otras Tablas

* `packaging_sites`: clave foránea `packaging_id` (N:M con `sites`)

---

### Flujo General

Define los embalajes estándar de la empresa. Cada embalaje puede ser asignado a múltiples clientes vía `packaging_sites`.

---

### Ejemplo de Inserciones

```sql
INSERT INTO packaging (packaging_type, packaging_name, weight, dimension, created_by)
VALUES ('CAJA_PEQUEÑA', 'Caja pequeña', 0.8, '30x20x10cm', 'admin');
```

---

### Índices recomendados

```sql
CREATE UNIQUE INDEX idx_packaging_type ON packaging (packaging_type);
```
