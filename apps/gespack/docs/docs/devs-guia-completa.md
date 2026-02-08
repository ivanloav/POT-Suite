---
sidebar_position: 2
slug: /devs/guia-completa
---

# Guía técnica completa para desarrolladores GesPack

Esta guía te permitirá entender el proyecto GesPack a fondo, sin necesidad de revisar todo el código. Aquí tienes todo lo esencial para trabajar, mantener y ampliar la plataforma.

## 1. Arquitectura general
GesPack es una plataforma modular compuesta por:
- **Backend**: API REST con NestJS, TypeORM y PostgreSQL.
- **Frontend**: SPA en React + Vite, con CSS Modules e i18next.
- **Documentación**: Docusaurus para docs técnicas y de usuario.
- **Infraestructura**: Docker, NGINX, scripts de despliegue y configuración.

## 2. Estructura de carpetas
- **backend/**: Código fuente del API, entidades, DTOs, servicios, controladores, configuración Docker y scripts de migración.
- **frontend/**: Componentes React, hooks, páginas, configuración Vite, estilos y traducciones.
- **docs/**: Documentación editable en Markdown, configuración Docusaurus.
- **nginx/**: Archivos de configuración para el proxy y seguridad.
- **postgresql/**: Scripts SQL y configuración de la base de datos.
- **packages/shared/**: Código compartido entre backend y frontend (tipos, utilidades).
- **scripts/**: Scripts de despliegue y mantenimiento.

## 3. Flujo de datos
- El frontend consume la API REST del backend.
- Los datos viajan en formato JSON, usando DTOs definidos en `backend/src/orders/dto/` y otras carpetas.
- El backend gestiona la lógica de negocio, validaciones y acceso a la base de datos.
- El frontend renderiza los datos usando componentes y hooks personalizados.

## 4. Principales entidades y DTOs
- **Order**: Entidad principal de pedidos, con campos como `orderId`, `siteId`, `orderReference`, `orderAmount`, `status`, `paidAt`, etc.
- **User**: Gestión de usuarios y permisos.
- **Product, Customer, Payment**: Entidades relacionadas con los pedidos.
- **DTOs**: Definen la estructura de los datos enviados y recibidos por la API. Ejemplo: `OrderDTO`, `CreateOrderDto`, `OrderResponseDto`.

## 5. Autenticación y permisos
- El backend usa JWT para autenticar usuarios.
- Los permisos se gestionan por roles y sitios, permitiendo acceso granular a los datos.
- El frontend almacena el token y lo envía en cada petición.

## 6. Ciclo de vida de un pedido
1. El usuario crea un pedido desde el frontend.
2. El frontend envía los datos al endpoint `/orders`.
3. El backend valida, guarda y responde con el pedido creado.
4. El pedido puede cambiar de estado: pendiente, pagado, facturado, enviado, devuelto, cancelado.
5. Cada cambio de estado puede registrar fechas (`paidAt`, `invoicedAt`, etc.) y observaciones.
6. El usuario puede consultar, editar o exportar pedidos desde la interfaz.

## 7. Componentes clave del frontend
- **DataTable**: Listados y filtros avanzados.
- **OrderForm**: Formulario de creación/edición de pedidos.
- **CustomerFields, PaymentFields, NotesFields**: Subcomponentes modulares.
- **useOrdersList, useOrderFormState**: Hooks para lógica y estado.
- **Internacionalización**: Traducciones en `public/locales/` y uso de `useTranslation`.

## 8. Hooks personalizados y lógica compartida
- Los hooks gestionan el estado, validaciones y llamadas a la API.
- Ejemplo: `useOrdersList` define las columnas, filtros y render de la tabla de pedidos.
- El código compartido está en `packages/shared/`.

## 9. Internacionalización
- Todas las cadenas están en archivos JSON por idioma.
- El frontend usa `i18next` y el backend puede internacionalizar mensajes de error.

## 10. Despliegue y Docker
- Usa `docker-compose.yml` para levantar todos los servicios.
- NGINX actúa como proxy y capa de seguridad.
- Consulta los manuales en `docs/docs/` para despliegue en Mac y Ubuntu.

## 11. Testing y buenas prácticas
- Usa `pnpm test` en backend y frontend para ejecutar tests.
- Sigue las convenciones de código y nomenclatura.
- Haz revisiones de código antes de mergear a `develop`.

## 12. Extensibilidad
- Para añadir una feature, crea una rama desde `develop`.
- Añade nuevos endpoints en el backend y hooks/componentes en el frontend.
- Actualiza los DTOs y la documentación.
- Añade traducciones si es necesario.

## 13. Integración futura con chatbot
- El sistema está preparado para integrar un chatbot (OpenAI) en el frontend.
- El chatbot podrá responder dudas, guiar al usuario y ayudar en la navegación.
- La documentación y los endpoints se pueden ampliar para facilitar la integración.

---

Para cualquier duda técnica, consulta el canal de soporte interno, la documentación ampliada o abre un issue en GitHub.
