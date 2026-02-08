# GesPack - Novedades y Mejoras Recientes

Este documento recoge los cambios y mejoras más recientes implementados en GesPack, con el objetivo de servir como referencia para desarrolladores y facilitar el aprendizaje del funcionamiento actual del sistema.

---

## 1. **Mejora en la Disposición General de la Pantalla**

* Se reorganizó la estructura del `MainScreenLayout` para que los elementos clave (Título de la página, Breadcrumbs y contenido principal) sigan un orden lógico y consistente.
* Ahora el título del `Outlet` aparece primero, seguido del `Breadcrumb`, y luego el contenido específico de cada página.
* Esto mejora la legibilidad y la coherencia visual en todas las secciones de la aplicación.

**Motivo del cambio:**

* Antes, el `Breadcrumb` podía quedar desplazado o al final del contenido, dificultando la navegación contextual.

---

## 2. **Sistema de Breadcrumb Mejorado con i18n**

* Implementación de breadcrumbs dinámicos usando `useMatches()` para extraer rutas y parámetros.
* Cada ruta puede definir en su `handle` una función `crumb` que devuelve:

  * `label` traducido mediante `i18next`.
  * Un icono opcional para acompañar el texto.
* El sistema soporta traducciones centralizadas en un archivo `breadcrumb.json`, permitiendo mantenimiento fácil y consistente.

**Ventajas:**

* Navegación más intuitiva.
* Soporte multilenguaje desde la definición de rutas.
* Iconografía contextual para mejorar la usabilidad.

---

## 3. **Sidebar Adaptativa y Colapsable**

* El menú lateral ahora responde automáticamente al ancho de la pantalla:

  * **< 768px**: modo móvil, oculto por defecto y accesible mediante botón tipo *hamburguesa*.
  * **768px - 1024px**: sidebar colapsada por defecto para maximizar espacio.
  * **> 1024px**: sidebar expandida por defecto.
* Transiciones suaves para el colapso/expansión.
* Control de visibilidad sincronizado con la interfaz, permitiendo alternar entre estados sin recargar la página.

**Beneficios:**

* Mayor aprovechamiento del espacio en dispositivos pequeños.
* Experiencia de usuario más fluida en escritorio y móvil.

---

## 4. **Enlaces Internos y Redirecciones Mejoradas**

* El `Breadcrumb` ahora permite que el enlace "Home" lleve directamente al Dashboard cuando el usuario ya está autenticado.
* Se evita pasar por la ruta `/login` salvo que la sesión esté cerrada.
* Esto se gestiona mediante comprobaciones de estado de autenticación en la lógica de rutas.

**Resultado:**

* Navegación más directa para el usuario.
* Menos pasos innecesarios al moverse por la aplicación.

---

## 5. **Refactorización y Limpieza de Código**

* Eliminación de dependencias no utilizadas o redundantes.
* Tipado más estricto en funciones críticas para evitar errores de TypeScript.
* Separación de responsabilidades en componentes reutilizables (`Breadcrumbs`, `Topbar`, `Sidebar`).

**Ventajas para desarrolladores:**

* Código más fácil de mantener y extender.
* Menos probabilidad de errores en cambios futuros.

---

## 6. **Buenas Prácticas Aplicadas**

* Uso de `useTranslation` con namespaces (`sidebar`, `breadcrumb`, etc.) para evitar colisiones de claves.
* Uso de variables CSS (`--sidebar-w`) para manejar dinámicamente el ancho de la sidebar y facilitar personalización futura.
* Eventos de `resize` controlados para no sobrecargar el rendimiento.

---

## Próximos Pasos Sugeridos

1. Implementar control centralizado de autenticación para condicionar accesos desde el `Breadcrumb`.
2. Unificar estilos de `Breadcrumb` y `Topbar` para coherencia visual.
3. Extender el sistema de `crumb` para soportar rutas anidadas más complejas con parámetros dinámicos.

---

## 7. **Enrutado unificado: de `main.tsx`/`App.tsx` a `router.tsx`**

* **Qué se hizo:** Se centralizó toda la definición de rutas en `src/router.tsx` usando el *Data Router* de React Router v6 (`createBrowserRouter`).
* **Por qué:**

  * Permite `handle` por ruta (p. ej., `crumb` para breadcrumbs y `titleKey`) y mejor manejo de errores por árbol (`errorElement`).
  * Evita duplicar `RouterProvider` en `main` y `App`.
* **Cómo quedó:**

**`main.tsx`** (render mínimo con `StrictMode` y la app):

```tsx
import './i18n';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**`App.tsx`** (un único `RouterProvider`):

```tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export default function App() {
  return <RouterProvider router={router} />;
}
```

**`router.tsx`** (rutas públicas, privadas, breadcrumb y 404):

```tsx
import { createBrowserRouter } from 'react-router-dom';
import { ScreenLayout } from './components/layout/MainScreenLayout';
import { LoginForm } from './components/login/loginForm';
import { PrivateRoute } from './components/PrivateRoute';
import { Dashboard } from './components/dashboard/dashboard';
import { NotFound } from './components/NotFound';

export const router = createBrowserRouter([
  // Públicas
  { path: '/', element: <LoginForm />, handle: { crumb: (t:any) => ({ key: 'breadcrumb:login' }) } },

  // Privadas
  {
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <ScreenLayout />,
        handle: { crumb: (t:any) => ({ key: 'breadcrumb:home' }) },
        children: [
          { path: 'user/dashboard', element: <Dashboard />, handle: { crumb: (t:any) => ({ key: 'breadcrumb:dashboard' }) } },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },

  // Catch-all global
  { path: '*', element: <NotFound /> },
]);
```

> **Nota:** Mantener **un solo** `RouterProvider` (en `App.tsx` o en `main.tsx`, pero no en ambos). Si despliegas bajo subcarpeta, puedes pasar `{ basename: import.meta.env.BASE_URL }` al `createBrowserRouter`.

---

**Última actualización:** 13/08/2025
