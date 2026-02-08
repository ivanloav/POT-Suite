# Brands (Marcas)

## Índice

* [Cambios realizados desde `Marcas` a `Brands`](#cambios-realizados-desde-marcas-a-brands)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con Tablas Auxiliares](#relación-con-tablas-auxiliares)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones](#ejemplos-de-inserción-de-datos-para-brands)
* [Ejemplo de Consultas](#consultas-de-ejemplo)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados desde `Marcas` a `Brands`:

#### 1. General:

* Cambiado el nombre de la tabla de `Marcas` a `brands` para estandarizar en inglés y en `snake_case`.
* Los campos fueron traducidos y adaptados a PostgreSQL.

#### 2. Tipos de Datos:

* Adaptados a PostgreSQL:

  * `nvarchar` → `TEXT`
  * `datetime` → `TIMESTAMP`
  * `money` → `NUMERIC(19, 4)`
  * `int` → `BIGINT`

#### 3. Claves Primarias y Secundarias:

* Añadido `site_id` como parte de las claves primarias para soportar un entorno multi-cliente.
* Definido `brand_id` como clave primaria autonumérica (`GENERATED ALWAYS AS IDENTITY`).
* Restringido también el par `site_id + brand_name` como `UNIQUE` para evitar duplicados por cliente.

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo  | Tipo PostgreSQL | Comentario                   |
| ------------------- | ------------ | --------------- | ---------------------------- |
| ID_MARCA            | brand_id     | BIGINT          | Clave primaria autonumérica  |
| SITE_ID             | site_id      | BIGINT          | Identificador del cliente    |
| MARCA               | brand_name   | TEXT            | Nombre de la marca           |
| DESCRIPCION         | description  | TEXT            | Texto libre                  |
| FECHA_INICIO        | start_date   | DATE            | Fecha de inicio              |
| FECHA_FIN           | end_date     | DATE            | Fecha de fin                 |
| ACTIVO              | is_active    | BOOLEAN         | Marca activa o no            |
| CREADOR             | created_by   | TEXT            | Usuario que crea el registro |
| FECHA_CREACION      | created_at   | TIMESTAMP       | Fecha de creación            |
| MODIFICADOR         | modified_by  | TEXT            | Usuario que modifica         |
| FECHA_MODIFICACION  | updated_at  | TIMESTAMP       | Fecha de modificación        |

---

### Relación con Tablas Auxiliares

Actualmente no posee relaciones directas con tablas auxiliares. Se puede relacionar con `products` u otras que referencien `brand_id`.

---

### Flujo General

La tabla `brands` permite almacenar marcas por cliente (`site_id`). Cada marca debe tener un nombre único por cliente y puede estar activa o inactiva según el campo `is_active`.

---

### Ejemplos de Inserción de Datos para Brands

```sql
INSERT INTO brands (site_id, brand_name, description, start_date, end_date, created_by)
VALUES
  (1, 'Apple', 'Marca de tecnología', '2024-01-01', NULL, 'admin'),
  (1, 'Samsung', 'Electrónica y electrodomésticos', '2024-01-01', NULL, 'admin');
```

---

### Consultas de Ejemplo

```sql
-- Buscar marcas activas de un cliente
SELECT * FROM brands
WHERE site_id = 1 AND is_active = TRUE;

-- Buscar por nombre
SELECT * FROM brands
WHERE site_id = 1 AND brand_name ILIKE '%apple%';
```

---

### Índices recomendados

```sql
CREATE INDEX idx_brands_brand_id ON brands (brand_id);
CREATE INDEX idx_brands_brand_name ON brands (brand_name);
```
