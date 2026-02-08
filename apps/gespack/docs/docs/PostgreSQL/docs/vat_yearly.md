# VAT Yearly (IVA Anual)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Restricciones e índices](#restricciones-e-índices)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla original: `IVA_Anual` de SQL Server.
- Renombrada como `vat_yearly`.
- Añadido `site_id` como campo obligatorio para entorno multicliente.
- Clave técnica `vat_id` como `BIGINT IDENTITY`.
- Añadida restricción `UNIQUE (site_id, vat_type)`.
- Todos los campos adaptados a PostgreSQL con convención `snake_case`.
- Se añadieron campos de auditoría.

---

## Definición de campos

| Campo           | Tipo           | Descripción                          |
|------------------|----------------|---------------------------------------|
| vat_id           | BIGINT IDENTITY| Clave primaria técnica                |
| site_id          | BIGINT NOT NULL| ID del sitio                          |
| vat_type         | TEXT NOT NULL  | Tipo de IVA                           |
| vat_code         | TEXT           | Código de IVA                         |
| vat_percentage   | TEXT           | Porcentaje de IVA                     |
| vat_description  | TEXT           | Descripción del tipo de IVA           |
| created_by       | TEXT           | Usuario que crea el registro          |
| created_at       | TIMESTAMP      | Fecha de creación                     |
| updated_by      | TEXT           | Usuario que modifica el registro      |
| updated_at      | TIMESTAMP      | Fecha de modificación                 |

---

## Restricciones e índices

- `PRIMARY KEY (vat_id)`
- `UNIQUE (site_id, vat_type)`

### Índices recomendados:
```sql
CREATE INDEX idx_vat_yearly_vat_id ON vat_yearly (site_id, vat_id);
CREATE INDEX idx_vat_yearly_site_type ON vat_yearly (site_id, vat_type);
CREATE INDEX idx_vat_yearly_vat_code ON vat_yearly (site_id, vat_code);
CREATE INDEX idx_vat_yearly_vat_percentage ON vat_yearly (site_id, vat_percentage);
```

---

## Ejemplos de inserciones

```sql
INSERT INTO vat_yearly (site_id, vat_type, vat_code, vat_percentage, vat_description, created_by)
VALUES (1, 'IVA21', 'ES21', '21%', 'IVA General 21%', 'admin');
```

---

## Ejemplos de consultas

### Consultar IVA por cliente
```sql
SELECT * FROM vat_yearly
WHERE site_id = 1;
```

### Consultar porcentaje de IVA por tipo
```sql
SELECT vat_percentage FROM vat_yearly
WHERE site_id = 1 AND vat_type = 'IVA21';
