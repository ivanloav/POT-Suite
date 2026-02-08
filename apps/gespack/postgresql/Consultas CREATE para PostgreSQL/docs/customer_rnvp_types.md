# customer_rnvp_types (Tipos de RNVP)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Flujo General](#flujo-general)
* [Ejemplo de Inserciones](#ejemplo-de-inserciones)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

#### 1. General:

* Tabla auxiliar normalizada para clasificar clientes según restricciones de contacto (Retorno No Válido de Publicidad).
* Uso de `snake_case` en nombres.

#### 2. Tipos de Datos:

* `nvarchar` → `TEXT`
* `datetime` → `TIMESTAMP`
* `int` → `BIGINT`

#### 3. Claves Primarias:

* `rnvp_type_id` es clave primaria autonumérica.
* `site_id` obligatorio para entorno multi-cliente.

---

### Detalle de Transformaciones por Campo

| Campo original      | Campo nuevo    | Tipo PostgreSQL | Comentario                   |
| ------------------- | -------------- | --------------- | ---------------------------- |
| ID                  | rnvp_type_id   | BIGINT          | Clave primaria autonumérica  |
| SITE_ID             | site_id        | BIGINT          | Cliente asociado             |
| NAME                | name           | TEXT            | Nombre del tipo RNVP         |
| DESCRIPTION         | description    | TEXT            | Descripción                  |
| CREADOR             | created_by     | TEXT            | Usuario que crea el registro |
| FECHA_CREACION      | created_at     | TIMESTAMP       | Fecha de creación            |
| MODIFICADOR         | modified_by    | TEXT            | Usuario que modifica         |
| FECHA_MODIFICACION  | updated_at    | TIMESTAMP       | Fecha de modificación        |

---

### Flujo General

Define las restricciones RNVP aplicables a los clientes como "No contactar", "Correo devuelto", etc. Se usa como referencia externa desde la tabla `customers`.

---

### Ejemplo de Inserciones

```sql
INSERT INTO customer_rnvp_types (site_id, name, description, created_by)
VALUES (1, 'Correo devuelto', 'Dirección postal inválida detectada', 'sistema');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_rnvp_types_site_name ON customer_rnvp_types (site_id, name);
```
