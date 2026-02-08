# Frequency (Frecuencia)

## 📂 Índice
- [Cambios realizados y decisiones de estructura](#cambios-realizados-y-decisiones-de-estructura)
- [Definición de campos](#definición-de-campos)
- [Restricciones e índices](#restricciones-e-índices)
- [Ejemplos de inserciones](#ejemplos-de-inserciones)
- [Ejemplos de consultas](#ejemplos-de-consultas)

---

## Cambios realizados y decisiones de estructura

- Tabla original: `Frecuencia` de SQL Server.
- Renombrada como `frequency`.
- Añadido `site_id` como campo obligatorio para soporte multicliente.
- Clave primaria técnica: `frequency_id` autonumérica.
- Se añadió una restricción `UNIQUE (site_id, range_start, range_end)` para evitar solapamiento duplicado.
- Se añadieron campos de auditoría.

---

## Definición de campos

| Campo         | Tipo            | Descripción                                |
|---------------|------------------|---------------------------------------------|
| frequency_id  | BIGINT IDENTITY  | Clave primaria técnica                      |
| site_id       | BIGINT NOT NULL  | Cliente (sitio)                             |
| range_start   | TEXT             | Valor inicial del rango                     |
| range_end     | TEXT             | Valor final del rango                       |
| frequency_value | TEXT           | Frecuencia asociada                         |
| created_by    | TEXT             | Usuario que crea el registro                |
| created_at    | TIMESTAMP        | Fecha de creación                           |
| modified_by   | TEXT             | Usuario que modifica                        |
| updated_at   | TIMESTAMP        | Fecha de modificación                       |

---

## Restricciones e índices

- `PRIMARY KEY (frequency_id)`
- `UNIQUE (site_id, range_start, range_end)`

### Índices recomendados:
```sql
CREATE INDEX idx_frequency_frequency_id ON frequency (site_id, frequency_id);
CREATE INDEX idx_frequency_range_start ON frequency (site_id, range_start);
CREATE INDEX idx_frequency_site_start_end ON frequency (site_id, range_start, range_end);
CREATE INDEX idx_frequency_frequency_value ON frequency (site_id, frequency_value);
```

---

## Ejemplos de inserciones

```sql
INSERT INTO frequency (site_id, range_start, range_end, frequency_value, created_by)
VALUES (1, 'A001', 'A999', 'Alta frecuencia', 'admin');
```

---

## Ejemplos de consultas

### Consultar frecuencias por cliente
```sql
SELECT * FROM frequency
WHERE site_id = 1;
```

### Buscar frecuencia por rango
```sql
SELECT frequency_value FROM frequency
WHERE site_id = 1 AND range_start <= 'A123' AND range_end >= 'A123';
