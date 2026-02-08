## ✅ Multitenancy Checklist – GesPack (`site_id`-based isolation)

Este proyecto está diseñado como una base de datos **multicliente**, por lo tanto **todas las tablas y relaciones deben estar restringidas por `site_id`**. Este checklist asegura el cumplimiento del modelo.

### 🔒 1. Estructura de tablas
- [ ] Todas las tablas contienen `site_id BIGINT NOT NULL`.
- [ ] Las claves primarias son **simples** (`*_id`) y generadas con `IDENTITY`.
- [ ] Las claves de negocio (ej. `order_reference`, `customer_code`) tienen:

```sql
UNIQUE (site_id, clave_negocio)
```

### 🔗 2. Relaciones entre Tablas
- [ ] Todas las claves foráneas incluyen `site_id`:

```sql
FOREIGN KEY (site_id, foreign_id) REFERENCES otra_tabla(site_id, foreign_id)
```

- [ ] Las tablas referenciadas tienen restricciones de unicidad compuesta:

```sql
UNIQUE (site_id, foreign_id)
```

### ⚠️ 3. Protección ante Eliminaciones
- [ ] Las relaciones clave como `orders → actions` usan:

```sql
ON DELETE RESTRICT
```

  o están protegidas mediante un `BEFORE DELETE TRIGGER`.

### 🛡️ 4. Seguridad en Consultas
- [ ] Todas las consultas en el backend filtran por `site_id`:

```sql
WHERE site_id = :currentSiteId
```

- [ ] Las vistas (`VIEW`) incluyen `WHERE site_id = ...`.
- [ ] (Opcional) PostgreSQL Row-Level Security (RLS) activado por `site_id`.

### 🔍 5. Índices Recomendados
- [ ] Índices para claves de negocio por cliente:

```sql
CREATE INDEX idx_orders_site_reference ON orders (site_id, order_reference);
```

- [ ] Índices sobre campos frecuentes: `order_id`, `customer_id`, `product_ref`, etc.

### ⚙️ 6. Migraciones y Validaciones
- [ ] Todos los `ALTER TABLE` incluyen `site_id` en claves `UNIQUE` y `FOREIGN KEY`.
- [ ] No se define ninguna relación sin considerar `site_id`.
