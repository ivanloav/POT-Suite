# 🧩 Descripción de Componentes del Proyecto GesPack

Este documento detalla cada uno de los componentes principales del sistema GesPack, incluyendo el **frontend**, el **backend**, los **DTOs**, y servicios de autenticación y datos.

---
<p align="center">
  <img src="Diagrama-GesPack.png" alt="GesPack"/>
</p>

## 🖥️ Frontend (React + TypeScript)

### `LoginForm`

* **Función**: Autentica al usuario con sus credenciales.
* **Resultado**: Si es correcto, guarda la cookie JWT y redirige al dashboard.

### `PrivateRoute`

* **Función**: Protege las rutas privadas para que solo accedan usuarios autenticados.

### `Router`

* **Función**: Define la navegación entre componentes como Login, Dashboard, UsersList...

### `Topbar`

* **Función**: Muestra el usuario actual y permite seleccionar el `site` activo.

### `Sidebar`

* **Función**: Menú lateral con las secciones disponibles según el rol del usuario.

### `Dashboard`

* **Función**: Muestra los KPIs del usuario y sitio seleccionado.
* **Ejemplo**: pedidos pendientes, facturados, productos sin stock.

### `DataTable`

* **Función**: Tabla reutilizable con filtros, ordenación, paginación y fetch de datos remoto.

---

## 🧠 Backend (NestJS + TypeORM)

### `UsersController`

* **Función**: Gestiona endpoints relacionados con usuarios (crear, listar, filtrar).

### `AuthController`

* **Función**: Login, logout, recuperar datos del usuario autenticado (`/me`).

### `DashboardController`

* **Función**: Devuelve estadísticas y KPIs generales y por `site`.

### `SitesController`

* **Función**: Lista los `sites` asociados al usuario y el site actual.

---

## 📦 Services

### `AuthService`

* **Función**: Verifica credenciales, genera JWT, recupera datos de sesión.

### `SitesService`

* **Función**: Consulta en `user_site` los sitios asignados al usuario.

### `OrdersService`

* **Función**: Devuelve pedidos por sitio (o todos los sitios si no se ha seleccionado uno).

---

## 📄 DTOs (Data Transfer Objects)

### `LoginDto`

* **Propósito**: Validar el `email` y `password` recibidos en el login.

### `UserDto`

* **Propósito**: Definir los campos que el backend devuelve de un usuario.

### `CreateOrderDto`, `UpdateOrderDto`

* **Propósito**: Validan los campos al crear o editar un pedido.

### `FindOrdersQueryDto`

* **Propósito**: Controla los filtros de la tabla de pedidos: `status`, `dateFrom`, `siteId`, etc.

---

## 🛡️ Seguridad

### `SiteGuard`

* **Función**: Añade a `req.context` los `site_ids` permitidos por el usuario, y el site seleccionado si existe.

### `@SiteId()` Decorator

* **Función**: Extrae automáticamente `siteId` desde el contexto, evitando acceder a `req.context.siteId` en cada endpoint.

---

## 🔐 Autenticación

### JWT + Cookies HTTPOnly

* **Función**: El login genera un token JWT y lo guarda en una cookie segura.
* **Ventaja**: El frontend no accede al token directamente, más seguro.

---

## 🗃️ ORM: TypeORM

* Mapea entidades como `User`, `Order`, `Site`, `UserSite` a tablas SQL.
* Se usa en servicios para acceder a la base de datos con consultas tipadas y seguras.

---

¿Quieres incluir también la arquitectura de carpetas, tests o middlewares?
