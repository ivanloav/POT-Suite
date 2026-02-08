---
sidebar_position: 5
slug: /devs-frontend/i18n-estilos
---

# Internacionalización y estilos

GesPack soporta múltiples idiomas y utiliza CSS Modules para estilos locales.

## Internacionalización (i18n)
- Las traducciones están en `public/locales/`.
- Usa el hook `useTranslation` para acceder a las cadenas.
- Ejemplo:
```tsx
const [t] = useTranslation("order");
```

## Estilos
- Los estilos se definen en archivos `.css` dentro de `src/css/` y como módulos en los componentes.
- Ejemplo:
```css
.order-status-badge {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

---

Siguiente: [Testing y buenas prácticas](./testing)
