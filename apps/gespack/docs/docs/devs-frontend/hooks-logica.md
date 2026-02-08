---
sidebar_position: 4
slug: /devs-frontend/hooks-logica
---

# Hooks y lógica de negocio

Los hooks personalizados gestionan el estado, las validaciones y la comunicación con la API.

## Ejemplo de hook: useOrdersList
```tsx
// src/hooks/useOrdersList.tsx
export function useOrdersList() {
  // Define columnas, filtros y lógica de la tabla de pedidos
}
```

## Lógica compartida
- Los hooks permiten reutilizar lógica entre componentes y páginas.
- Ejemplo: `useOrderFormState` gestiona el estado del formulario de pedido.

## Flujo de datos
1. El hook realiza una petición a la API.
2. Actualiza el estado local/global.
3. El componente renderiza los datos actualizados.

---

Siguiente: [Internacionalización y estilos](./i18n-estilos)
