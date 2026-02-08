# 🌍 i18next en React – instalación, configuración y plantillas (ES/EN/FR)

Guía rápida para integrar **i18next** en una app React (TypeScript o JavaScript), con soporte para Español, Inglés y Francés. Incluye **plantillas de traducciones** y ejemplos listos para copiar y pegar.

---

## 0) Requisitos

* React 17+ / 18+ (Vite, CRA, Next, etc.)
* Node 18+
* Gestor de paquetes: `pnpm` (recomendado), `npm` o `yarn`

> **Nota**: El usuario usa TypeScript y Vite en *GesPack*. Esta guía funciona igual con JS.

---

## 1) Instalación

```bash
# Con pnpm (recomendado)
pnpm add i18next react-i18next i18next-http-backend i18next-browser-languagedetector

# Alternativas
npm i i18next react-i18next i18next-http-backend i18next-browser-languagedetector
yarn add i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

---

## 2) Dónde colocar las traducciones

### Opción A (recomendada): **`public/locales`**

Las traducciones se sirven como archivos estáticos. Es lo más simple con `i18next-http-backend`.

```
public/
  locales/
    es/translation.json
    en/translation.json
    fr/translation.json
```

### Opción B: **`src/locales`**

Si prefieres mantenerlas en `src`, no podrás cargarlas por HTTP sin exponerlas. Usa el **modo recursos embebidos** (ver apartado 7) o configura un servidor estático adicional.

> Si ahora mismo ya tienes `src/locales`, puedes **mover la carpeta a `public/locales`** para seguir la Opción A sin cambios de código.

---

## 3) Configuración base (`src/i18n.ts`)

```ts
// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Carga JSON por HTTP desde /public
  .use(LanguageDetector) // Detecta idioma del navegador, localStorage, etc.
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'fr'],
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage']
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json' // <- ruta en public/
    }
  });

export default i18n;
```

### Punto de entrada (Vite/CRA)

Asegúrate de **importar `i18n.ts`** antes de usar `t()` en cualquier componente.

```ts
// src/main.tsx (Vite) o src/index.tsx (CRA)
import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 4) Plantillas de traducciones (ES/EN/FR)

> Coloca estos archivos en `public/locales/<lng>/translation.json`.

### `public/locales/es/translation.json`

```json
{
  "app": {
    "title": "GesPack",
    "subtitle": "Gestión de pedidos e inventario"
  },
  "navbar": {
    "home": "Inicio",
    "orders": "Pedidos",
    "customers": "Clientes",
    "products": "Productos",
    "settings": "Configuración"
  },
  "orders": {
    "list_title": "Listado de pedidos",
    "new_order": "Nuevo pedido",
    "search_placeholder": "Buscar por referencia o cliente…",
    "empty": "No hay pedidos disponibles",
    "count": "Tienes {{count}} pedido",
    "count_plural": "Tienes {{count}} pedidos"
  },
  "customers": {
    "list_title": "Clientes",
    "empty": "No hay clientes",
    "new": "Nuevo cliente"
  },
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "confirm": "Confirmar"
  }
}
```

### `public/locales/en/translation.json`

```json
{
  "app": {
    "title": "GesPack",
    "subtitle": "Orders and inventory management"
  },
  "navbar": {
    "home": "Home",
    "orders": "Orders",
    "customers": "Customers",
    "products": "Products",
    "settings": "Settings"
  },
  "orders": {
    "list_title": "Order list",
    "new_order": "New order",
    "search_placeholder": "Search by reference or customer…",
    "empty": "No orders available",
    "count": "You have {{count}} order",
    "count_plural": "You have {{count}} orders"
  },
  "customers": {
    "list_title": "Customers",
    "empty": "No customers",
    "new": "New customer"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "confirm": "Confirm"
  }
}
```

### `public/locales/fr/translation.json`

```json
{
  "app": {
    "title": "GesPack",
    "subtitle": "Gestion des commandes et des stocks"
  },
  "navbar": {
    "home": "Accueil",
    "orders": "Commandes",
    "customers": "Clients",
    "products": "Produits",
    "settings": "Paramètres"
  },
  "orders": {
    "list_title": "Liste des commandes",
    "new_order": "Nouvelle commande",
    "search_placeholder": "Rechercher par référence ou client…",
    "empty": "Aucune commande disponible",
    "count": "Vous avez {{count}} commande",
    "count_plural": "Vous avez {{count}} commandes"
  },
  "customers": {
    "list_title": "Clients",
    "empty": "Aucun client",
    "new": "Nouveau client"
  },
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "confirm": "Confirmer"
  }
}
```

---

## 5) Uso en componentes

```tsx
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { t, i18n } = useTranslation();

  return (
    <nav>
      <ul>
        <li>{t('navbar.home')}</li>
        <li>{t('navbar.orders')}</li>
        <li>{t('navbar.customers')}</li>
        <li>{t('navbar.products')}</li>
        <li>{t('navbar.settings')}</li>
      </ul>

      <div>
        <button onClick={() => i18n.changeLanguage('es')}>ES</button>
        <button onClick={() => i18n.changeLanguage('en')}>EN</button>
        <button onClick={() => i18n.changeLanguage('fr')}>FR</button>
      </div>
    </nav>
  );
}
```

Pluralización (automática por idioma):

```tsx
function OrdersCount({ count }: { count: number }) {
  const { t } = useTranslation();
  return <p>{t('orders.count', { count })}</p>;
}
```

Interpolación de variables:

```tsx
<p>{t('orders.search_placeholder')}</p>
```

---

## 6) Tipos (TypeScript) – opcional pero recomendado

Para tener **autocompletado** de claves y tipos seguros, crea `src/i18n.d.ts` y **mapea tu JSON** (ejemplo parcial):

```ts
// src/i18n.d.ts
import 'i18next';
import es from '../public/locales/es/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof es; // usa el JSON ES como base de tipos
    };
  }
}
```

> **Tip**: Vite permite importar JSON directamente. Si usas CRA, habilita `resolveJsonModule` en `tsconfig.json`.

---

## 7) Alternativa sin HTTP backend (recursos embebidos)

Si prefieres dejar los JSON en `src/locales` y **no** servirlos desde `public`, puedes inyectarlos como recursos:

```ts
// src/i18n.ts (modo embebido)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';
import fr from './locales/fr/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      fr: { translation: fr }
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false }
  });

export default i18n;
```

> En este modo **no necesitas** `i18next-http-backend`. Puedes mantener `LanguageDetector` si quieres.

---

## 8) Buenas prácticas de organización

* Divide por **módulos** (`navbar`, `orders`, `customers`, `common`, etc.) si tu app crece → puedes usar **namespaces** y ficheros separados.
* Evita usar el texto literal como clave. Usa rutas tipo `orders.list_title`.
* No metas HTML complejo en las traducciones; si lo necesitas, usa el componente `<Trans/>` de `react-i18next`.
* Establece `supportedLngs` y valida que todas las claves existen en cada idioma (scripts de CI opcionales).

---

## 9) Troubleshooting

* **No carga traducciones**: revisa que estén en `public/locales` y la ruta `loadPath` sea correcta.
* **404 en `/locales/...`**: en Vite/CRA, cualquier cosa dentro de `public/` se sirve en la raíz. Asegúrate de reiniciar el dev server tras mover archivos.
* **No cambia idioma**: limpia `localStorage` o desactiva `LanguageDetector` temporalmente.
* **Tipos de TS no autocompletan**: revisa `src/i18n.d.ts` y que tu editor haya recargado el proyecto.

---

## 10) Scripts útiles (opcional)

Añade a `package.json` para validar JSONs (ejemplo con `ajv` o simple lint JSON):

```json
{
  "scripts": {
    "i18n:check": "ts-node scripts/check-i18n.ts"
  }
}
```

---

## 11) Checklist de integración

* [ ] Instalar dependencias
* [ ] Crear `public/locales/{es,en,fr}/translation.json`
* [ ] Añadir `src/i18n.ts` e importarlo en `main.tsx`
* [ ] Usar `t('...')` en componentes
* [ ] Añadir botones o selector de idioma
* [ ] (TS) Añadir `src/i18n.d.ts` para tipos

---

### ¿Quieres que te genere ahora mismo la estructura de carpetas y los tres `translation.json` con más módulos (dashboard, invoices, auth, etc.)? Pídemelo y lo dejo aún más completo. 💪
