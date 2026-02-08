# customer_marked_types (Tipos de Marcado)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones](#ejemplo-de-inserciones)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

#### 1. General:

* Tabla auxiliar normalizada para clasificar tipos de marcado aplicables a clientes.
* Uso de `snake_case` en nombres.

#### 2. Tipos de Datos:

* `nvarchar` → `TEXT`
* `datetime` → `TIMESTAMP`
* `int` → `BIGINT`

#### 3. Claves Primarias:

* `marked_type_id` es clave primaria autonumérica.
* `site_id` obligatorio para entorno multi-cliente.

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo      | Tipo PostgreSQL | Comentario                   |
| ------------------- | ---------------- | --------------- | ---------------------------- |
| ID                  | marked_type_id   | BIGINT          | Clave primaria autonumérica  |
| SITE_ID             | site_id          | BIGINT          | Cliente asociado             |
| NAME                | name             | TEXT            | Nombre del tipo              |
| DESCRIPTION         | description      | TEXT            | Descripción opcional         |
| ACTIVO              | is_active        | BOOLEAN         | Registro activo              |
| CREADOR             | created_by       | TEXT            | Usuario que crea el registro |
| FECHA_CREACION      | created_at       | TIMESTAMP       | Fecha de creación            |
| MODIFICADOR         | modified_by      | TEXT            | Usuario que modifica         |
| FECHA_MODIFICACION  | updated_at      | TIMESTAMP       | Fecha de modificación        |

---

### Flujo General

Esta tabla permite clasificar a los clientes con etiquetas o marcas específicas como "VIP", "Inactivo", "Moroso", etc. Se vincula a la tabla principal de `customers` mediante el campo `marked_type_id`.

---

### Ejemplo de Inserciones

```sql
INSERT INTO customer_marked_types (site_id, name, description, created_by)
VALUES (1, 'Bloqueado', 'Cliente con facturación pendiente', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_marked_types_site_name ON customer_marked_types (site_id, name);
```
