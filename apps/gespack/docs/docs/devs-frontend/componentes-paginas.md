---
sidebar_position: 3
slug: /devs-frontend/componentes-paginas
---

# Componentes y páginas clave

GesPack utiliza componentes modulares y páginas especializadas para cada funcionalidad.

## Componentes principales
- **DataTable**: Listados y filtros avanzados.
- **OrderForm**: Formulario de creación/edición de pedidos.
- **CustomerFields, PaymentFields, NotesFields**: Subcomponentes para datos específicos.
- **Tooltip**: Tooltips personalizados para información contextual.

## Ejemplo de componente
```tsx
// src/components/shared/DataTable.tsx
export function DataTable({ columns, data }) {
  // Renderiza la tabla con columnas y datos
}
```

## Páginas principales
- **Pedidos**: Listado y gestión de pedidos.
- **Clientes**: Consulta y edición de clientes.
- **Productos**: Gestión de productos y líneas de pedido.
- **Dashboard**: Estadísticas y paneles.

## Ejemplo de página
```tsx
// src/pages/OrdersList.tsx
export function OrdersList() {
  // Renderiza la lista de pedidos usando DataTable
}
```

---

Siguiente: [Hooks y lógica de negocio](./hooks-logica)
