---
sidebar_position: 11
slug: /devs-backend/flujo-editar-pedido
---

# Flujo técnico: edición de pedido

Esta guía explica el proceso técnico para editar un pedido en GesPack.

## 1. Frontend: flujo y componentes
- El usuario accede a la lista de pedidos y selecciona uno para editar.
- Se renderiza el componente `OrderForm` con los datos del pedido.
- El estado y lógica se gestionan con el hook `useOrderFormState`, que carga los datos existentes y permite modificarlos.
- Los subcomponentes (`CustomerFields`, `PaymentFields`, `NotesFields`) permiten editar cada sección.
- Al guardar, se valida el formulario y se llama a la API con los datos modificados.

### Ejemplo de uso del hook
```tsx
const {
  order,
  setOrderField,
  submitOrder,
  errors
} = useOrderFormState(orderId);
```

## 2. Backend: recepción y procesamiento
- El endpoint `/orders/:id` recibe el DTO `UpdateOrderDto`.
- El controlador valida y llama al servicio `OrdersService`.
- El servicio actualiza la entidad `Order` en la base de datos.
- Se responde con el DTO actualizado.

### Ejemplo de endpoint
```typescript
@Put(':id')
async update(@Param('id') id: number, @Body() dto: UpdateOrderDto) {
  return this.ordersService.updateOrder(id, dto);
}
```

## 3. Validaciones y restricciones
- El backend valida los cambios permitidos según el estado del pedido.
- Si el pedido está pagado/facturado, algunos campos no pueden modificarse.
- Se responde con mensajes claros para el frontend.

## 4. Extensión y personalización
- Para permitir nuevos cambios, modifica el DTO y la lógica del servicio.
- Añade tests y documentación para cada cambio.

---

Para dudas técnicas, consulta el canal de soporte o la documentación ampliada.
