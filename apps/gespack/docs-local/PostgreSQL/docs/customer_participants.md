# customer\_participants (Participaciones de Clientes)

## Índice

* [Cambios realizados](#cambios-realizados)
* [Detalle de Transformaciones por Campo](#detalle-de-transformaciones-por-campo)
* [Relación con otras Tablas](#relación-con-otras-tablas)
* [Función de la tabla](#función-de-la-tabla)
* [Ejemplo de Inserción con QR](#ejemplo-de-inserción-con-qr)
* [Índices recomendados](#índices-recomendados)

---

### Cambios realizados

* Tabla renombrada a `customer_participants` para mayor claridad y contexto.
* Incluye campo `site_id` (multi-tenant) y FK a `sites`.
* FK compuesta `(site_id, customer_id)` a `customers`.
* Guarda también el `customer_code` (BIGINT) para búsquedas rápidas desde QR o integración externa.
* Campos específicos para la participación (`action`, `marked`, `reading_date`).
* Eliminados todos los datos duplicados que ya existen en `customers`.
* Auditoría estándar.

---

### Detalle de Transformaciones por Campo

| Campo                     | Tipo        | Comentario                                |
| ------------------------- | ----------- | ----------------------------------------- |
| customer\_participant\_id | BIGINT (PK) | Clave primaria autonumérica               |
| site\_id                  | BIGINT      | Cliente/tenant, FK a `sites`              |
| customer\_id              | BIGINT      | FK a `customers`                          |
| customer\_code            | BIGINT      | Código redundante del cliente             |
| action                    | TEXT        | Acción/campaña/motivo de la participación |
| marked                    | TEXT        | Flag o estado de la participación         |
| reading\_date             | DATE        | Fecha de lectura o participación          |
| created\_by               | TEXT        | Auditoría: usuario creador                |
| created\_at               | TIMESTAMP   | Fecha de creación (por defecto actual)    |
| modified\_by              | TEXT        | Usuario última modificación               |
| modified\_at              | TIMESTAMP   | Fecha última modificación                 |

---

### Relación con otras Tablas

* `site_id` → `sites(site_id)` (ON DELETE RESTRICT)
* `(site_id, customer_id)` → `customers(site_id, customer_id)` (ON DELETE RESTRICT)

---

### Función de la tabla

Esta tabla registra las participaciones de los clientes en campañas, acciones u otros roles. La relación con el cliente es por su `customer_id`, pero también se guarda el `customer_code` para facilitar búsquedas rápidas desde aplicaciones o integraciones donde solo se dispone del código (por ejemplo, cuando se escanea un QR que solo contiene el código).

El flujo estándar al insertar es:

* Se escanea el QR y se obtiene el `customer_code`.
* Se busca el `customer_id` asociado en la tabla `customers` (`SELECT customer_id FROM customers WHERE site_id = ? AND customer_code = ?`).
* Se inserta el registro en `customer_participants` usando ambos valores.

---

### Ejemplo de Inserción con QR

```sql
-- Paso 1: Buscar customer_id con el código leído
SELECT customer_id FROM customers WHERE site_id = 1 AND customer_code = 123456;

-- Paso 2: Insertar la participación
INSERT INTO customer_participants (site_id, customer_id, customer_code, action, marked, reading_date, created_by)
VALUES (1, 42, 123456, 'PROMO2024', 'VIP', '2024-11-03', 'admin');
```

---

### Índices recomendados

```sql
CREATE INDEX idx_customer_participants_site_customer ON customer_participants (site_id, customer_id);
CREATE INDEX idx_customer_participants_site_code ON customer_participants (site_id, customer_code);
```
