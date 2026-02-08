---
sidebar_position: 2
slug: /devs-frontend/estructura
---

# Estructura de carpetas del Frontend

El frontend de GesPack está organizado para facilitar la reutilización y el mantenimiento.

## Árbol de carpetas principal

```text
frontend/
├── src/
│   ├── components/
│   ├── css/
│   ├── pages/
│   ├── hooks/
│   ├── context/
│   └── ...
├── public/
│   ├── locales/
│   └── ...
├── package.json
├── vite.config.ts
├── tsconfig.json
└── ...
```

## Descripción de carpetas clave
- **components/**: Componentes visuales reutilizables.
- **pages/**: Vistas principales (Pedidos, Clientes, etc).
- **hooks/**: Lógica de negocio y conexión con la API.
- **context/**: Estado global (usuario, sitio, etc).
- **css/**: Estilos globales y módulos CSS.
- **public/locales/**: Archivos de traducción para i18n.

## Ejemplo de archivo
```tsx
// src/components/shared/DataTable.tsx
export function DataTable(props) {
  // ... lógica de tabla
}
```

---

Siguiente: [Componentes y páginas clave](./componentes-paginas)
