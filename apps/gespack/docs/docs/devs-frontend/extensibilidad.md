---
sidebar_position: 7
slug: /devs-frontend/extensibilidad
---

# Extensibilidad y nuevas features

GesPack está diseñado para ser modular y fácil de ampliar.

## Añadir una nueva feature
1. Crea una rama desde `develop`.
2. Añade el nuevo componente o página en `src/components/` o `src/pages/`.
3. Implementa la lógica en hooks si es necesario.
4. Añade tests y documentación.
5. Haz merge tras revisión de código.

## Ejemplo: Nuevo componente
```tsx
// src/components/OrderStats.tsx
export function OrderStats({ orders }) {
  // Renderiza estadísticas de pedidos
}
```

## Buenas prácticas
- Mantén la estructura modular.
- Documenta cada nuevo componente y página.
- Añade traducciones si es necesario.

---

Siguiente: [Integración futura con chatbot](./chatbot)
