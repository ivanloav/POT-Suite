# Error: Violación de Clave Foránea `orders_site_id_customer_id_fkey`

## 🔴 Error Completo
```
insert or update on table "orders" violates foreign key constraint "orders_site_id_customer_id_fkey"
```

## 🔍 Causa del Error

La tabla `orders` tiene una **clave foránea compuesta**:
```sql
FOREIGN KEY (site_id, customer_id) REFERENCES customers(site_id, customer_id) ON DELETE RESTRICT
```

Esto significa que cuando intentas insertar un pedido con:
- `site_id = 1`
- `customer_id = 101001`

**Debe existir** un registro en la tabla `customers` con exactamente esa combinación.

## ✅ Soluciones

### Solución 1: Verificar que el Cliente Existe (RECOMENDADA)

Ejecuta esta consulta en PostgreSQL para verificar:

```sql
SELECT * FROM customers 
WHERE site_id = 1 AND customer_id = 101001;
```

**Si no devuelve resultados**, necesitas:
1. Crear el cliente en la base de datos
2. O usar un `customer_id` que sí exista

**Si devuelve resultados**, verifica los tipos de datos:
```sql
SELECT 
  site_id::text as site_id_type,
  customer_id::text as customer_id_type,
  site_id,
  customer_id
FROM customers 
WHERE site_id = 1 AND customer_id = 101001;
```

### Solución 2: Hacer `customer_id` Nullable (Si aplica)

Si quieres permitir pedidos **sin cliente asociado**, modifica la tabla:

```sql
ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL;
```

Y luego haz la FK opcional eliminándola y recreándola con verificación de null.

### Solución 3: Verificar el Código del Cliente

En tu caso, estás usando `customerCode = "101001"`, pero el campo que se guarda es `customerId`.

Verifica que:
1. `customerCode` en la tabla `customers` es único por site
2. `customerId` (PK) es el que debe ir en la FK de orders

**Posible confusión:**
- `customerCode`: Campo de negocio (ej: "101001")
- `customerId`: PK autoincremental (ej: 1, 2, 3...)

## 🔧 Debug

Verifica qué estás enviando exactamente:

```javascript
console.log('Payload siteId:', typeof payload.siteId, payload.siteId);
console.log('Payload customerId:', typeof payload.customerId, payload.customerId);
```

Debe mostrar:
```
Payload siteId: number 1
Payload customerId: number 101001
```

## 📊 Estructura de Datos Esperada

```typescript
{
  siteId: 1,           // number - Debe existir en sites
  customerId: 101001,  // number - Debe existir en customers con site_id = 1
  // ... otros campos
}
```

## 🎯 Acción Inmediata

**Ejecuta esta consulta para ver clientes del site 1:**
```sql
SELECT customer_id, customer_code, customer_first_name, customer_last_name 
FROM customers 
WHERE site_id = 1
LIMIT 10;
```

Esto te mostrará qué `customer_id` puedes usar para pruebas.
