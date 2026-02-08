# Mapeo de Campos: FormData → Backend DTO

## ✅ ACTUALIZADO: DTO Alineado con la Entidad

El DTO ahora usa los **mismos tipos** que la entidad Order. Campos `NUMERIC` de PostgreSQL se mapean como `string` en TypeScript.

## Tipos de Campos

### 🔢 Campos que son `number` (IDs y contadores)
- `siteId`, `brandId`, `orderSourceId`, `actionId`, `actionCategoryId`, `actionPriorityId`
- `customerId`, `paymentTypeId`, `createdBy`
- `orderLines`, `weight`

### 📝 Campos que son `string` (NUMERIC de PostgreSQL)
- `shippingCost`, `mandatoryShippingFee`
- `clientType`
- `orderAmount`, `bi1`, `bi2`, `tva1`, `tva2`
- `valueEm`
- `upsellingAmount`, `discount`
- `clubCardFee`, `clubCardDiscount`
- `noArticleAmount`
- `bavAmount`, `amountDue`, `generatedBavAmount`

## Mapeo Frontend → Backend

| Frontend FormData | Backend DTO | Tipo | Conversión |
|-------------------|-------------|------|------------|
| `siteId` | `siteId` | `number` | Directo |
| `siteName` | `siteName` | `string` | Auxiliar (no en DB) |
| `brandId` | `brandId` | `number` | Directo |
| `orderSourceId` | `orderSourceId` | `number` | `parseInt()` |
| `actionId` | `actionId` | `number` | `parseInt()` |
| `actionCategoryId` | `actionCategoryId` | `number` | Directo |
| `priorityTypeId` | `actionPriorityId` | `number` | `parseInt()` |
| `shippingCost` | `shippingCost` | `string` | `String()` |
| `mandatoryFee` | `mandatoryShippingFee` | `string` | `String()` |
| `customer` | `customerId` | `number` | `parseInt()` |
| `customerFirstName` | `firstName` | `string` | Directo |
| `customerLastName` | `lastName` | `string` | Directo |
| `customerType` | `clientType` | `string` | `String()` |
| `participant` | `participant` | `string` | Directo |
| `paymentTypeId` | `paymentTypeId` | `number` | Directo |
| `totals.totalOrder` | `orderAmount` | `string` | `String()` |
| `createdBy` | `createdBy` | `number` | userId |
| `section` | `section` | `string` | Auxiliar (no en DB) |
| `order_items` | `order_items` | `array` | Directo |

### 📝 Campos de Líneas de Pedido (order_items)

| Frontend | Backend DTO | Mapeo Actual |
|----------|-------------|--------------|
| `site_id` | ✅ Correcto | Ya se envía |
| `product_ref` | ✅ Correcto | l.reference |
| `qty` | ✅ Correcto | l.qty |
| `unit_price` | ✅ Correcto | l.price |
| `line_import` | ✅ Correcto | l.import |

## 🔧 Implementación en `CreateOrderForm.tsx`

```typescript
const payload = {
  ...formData,
  
  // IDs como number
  customerId: formData.customer ? parseInt(formData.customer, 10) : undefined,
  actionPriorityId: formData.priorityTypeId ? parseInt(formData.priorityTypeId, 10) : undefined,
  orderSourceId: formData.orderSourceId ? parseInt(formData.orderSourceId, 10) : undefined,
  actionId: formData.actionId ? parseInt(formData.actionId, 10) : undefined,
  
  // Campos NUMERIC como string
  clientType: formData.customerType ? String(formData.customerType) : undefined,
  orderAmount: String(totalOrder),
  shippingCost: formData.shippingCost != null ? String(formData.shippingCost) : undefined,
  mandatoryShippingFee: formData.mandatoryFee != null ? String(formData.mandatoryFee) : undefined,
  
  // Status
  status: 'pending',
  
  // Teléfonos normalizados
  customerPhone: fixed.valid ? (fixed.e164 || formData.customerPhone) : '',
  customerMobile: mobile.valid ? (mobile.e164 || formData.customerMobile) : '',
  
  // Campos del sistema
  siteId,
  siteName,
  createdBy: userId,
  section: formData.section,
  
  // Líneas de pedido
  order_items,
};
```

## 📊 Ejemplo de Payload Completo

```json
{
  "siteId": 1,
  "siteName": "MAYLIS",
  "brandId": 1,
  "orderSourceId": 13,
  "actionId": 1,
  "actionCategoryId": 1,
  "actionPriorityId": 4,
  "shippingCost": 4.9,
  "mandatoryShippingFee": 0,
  "customerId": 101001,
  "firstName": "Lucía",
  "lastName": "García",
  "clientType": 1,
  "participant": "189073",
  "paymentTypeId": 1,
  "orderAmount": 22.4,
  "status": "pending",
  "createdBy": 1,
  "section": "HojasDePedido",
  "order_items": [
    {
      "site_id": 1,
      "product_ref": "PROD-A1",
      "qty": 1,
      "unit_price": 35,
      "line_import": 35
    }
  ]
}
```

## 🎯 Próximos Pasos

1. Modificar `CreateOrderForm.tsx` línea ~450 para incluir las conversiones
2. Probar la creación de pedido
3. Verificar en la base de datos que los campos se guardan correctamente
4. Verificar que `order_items` se guardan en la tabla `order_items`
