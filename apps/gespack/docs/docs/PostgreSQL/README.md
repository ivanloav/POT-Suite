# Conversión de Tablas de SQL Server a PostgreSQL

Este documento describe el proceso de conversión de tablas de una base de datos en SQL Server a PostgreSQL. Aquí se detallan los pasos realizados, las diferencias clave entre ambos sistemas y las decisiones tomadas durante la migración.

## Índice
   - 🏛️ **[Principios Generales de la Base de Datos](#principios-generales-de-la-base-de-datos)**
   - ✅ [CheckList de verificación para DB multi-tenant](docs/checklist-multitenant.md)
   - 🔑 [Inclusión del Campo `site_id`](#inclusión-del-campo-site_id)
   - 🕵️ [Campos de Auditoría](#campos-de-auditoría)
   - 📦 [Tablas Creadas o convertidas](#tablas-creadas-o-convertidas)
   - 💡 [Función de cada tabla](#-función-de-cada-tabla)
   - 🧩 [Diagrama Entidad-Relación GesPack (PNG)](#-diagrama-entidad-relación-gespack-png)
   - ❓ [FAQ y buenas prácticas](#faq-y-buenas-prácticas)
   - 🚀 [Scripts de migración y despliegue](#scripts-de-migración-y-despliegue)
   - ⚠️ [Compatibilidad](#compatibilidad)
   - 🛠️ [Contacto y mantenimiento](#contacto-y-mantenimiento)
   - 📄 [Licencia](#-licencia)

## 🏛️ Principios Generales de la Base de Datos

### Inclusión del Campo `site_id`
- **¿Qué es `site_id`?**
  - El campo `site_id` identifica de forma única al cliente (sitio) al que pertenece cada registro. Es esencial en un entorno multi-cliente.
  
- **¿Por qué es importante?**
  - Permite que varias empresas o clientes utilicen la misma base de datos sin conflictos, asegurando que todos los datos estén correctamente segregados.
  
- **¿Cómo se utiliza?**
  - **Claves Primarias**: Todas las tablas principales utilizan `site_id` como parte de la clave primaria compuesta.
  - **Claves Foráneas**: Las relaciones entre tablas incluyen `site_id` para garantizar la coherencia y aislamiento de los datos.

### Campos de Auditoría
- **¿Qué son estos campos?**
  - Todas las tablas incluyen los siguientes campos para rastrear la creación y modificación de los registros:
    - `created_by`: Nombre del usuario que realizó la inserción.
    - `created_at`: Fecha y hora de la inserción.
  - `updated_by`: Nombre del usuario que realizó la última modificación.
    - `updated_at`: Fecha y hora de la última modificación.

- **¿Por qué son importantes?**
  - Ayudan a mantener un historial claro de quién realiza cambios en los datos y cuándo se realizan, facilitando la auditoría y el mantenimiento.

- **¿Cómo se utilizan?**
  - Los valores de `created_by` y `updated_by` se asignan desde la capa de la aplicación o mediante triggers, según el flujo de trabajo.
  - Los valores de `created_at` y `updated_at` se establecen automáticamente con `CURRENT_TIMESTAMP` o por la lógica de negocio.

---

Para información detallada de cada tabla, consulta los archivos específicos en la carpeta `docs`.

### 📦 Tablas Creadas o convertidas
   - [Sites (Clientes / Sites)](docs/sites.md)
   - [Users (Usuarios de la Aplicación)](docs/users.md)
   - [User Sites (Asignación de Usuarios a Sites)](docs/user_site.md)
   - [Brands (Marcas)](docs/brands.md)
   - [Actions Categories (Categorías de Acciones)](docs/action_categories.md)
   - [Actions Priority Types (Tipos de Prioridad de Acción)](docs/action_priority_types.md)
   - [Actions Category Costs (Costes por Categoría de Acción)](docs/action_category_costs.md)
   - [Actions (Acciones)](docs/actions.md)
   - [Customers (Clientes)](docs/customers.md)
   - [Customers Marked Types (Tipos de Marcado de Clientes)](docs/customer_marked_types.md)
   - [Customers RNVP Types (Tipos RNVP de Clientes)](docs/customer_rnvp_types.md)
   - [Correspondence (Correspondencia)](docs/correspondence.md)
   - [Order Payments Card Types (Tipos de Tarjeta)](docs/order_payment_card_types.md)
   - [Order Payments (Pagos de Pedido: engloba pagos totales y pagos aplazados)](docs/order_payments.md)
   - [Order Payment Schedules (Plazos de Pago del Pedido)](docs/order_payment_schedules.md)
   - [Orders (Pedidos)](docs/orders.md)
   - [Order Addresses (Direcciones de Pedido)](docs/order-addresses.md)
   - [Order Notes (Notas de Pedido)](docs/order-notes.md)
   - [Order Items (Líneas de Pedido)](docs/order_items.md)
   - [Order Item Substitutes (Sustituciones de Líneas de Pedido)](docs/order_item_substitutes.md)
   - [Packaging (Tipos de Embalaje)](docs/packaging.md)
   - [Packaging Sites (Asignación de Embalajes por Cliente)](docs/packaging_sites.md)
   - [Product Substitutes (Sustituciones de Producto)](docs/product_substitutes.md)
   - [Product Substitutes Log (Histórico Sustituciones)](docs/product_substitutes_log.md)
   - [Products (Productos)](docs/products.md)
   - [Product Bundles (Bundles de Productos)](docs/product_bundles.md)
   - [Returns (Devoluciones)](docs/returns.md)
   - [Return Items (Líneas de Devolución)](docs/return_items.md)
   - [Invoicing (Facturación)](docs/invoicing.md)
   - [Invoicing refunds (Facturación Abonos)](docs/invoicing_refunds.md)
   - [Montant (Tramos de Importe)](docs/montant.md)
   - [Recency (Rangos de recencia)](docs/recency.md)
   - [Customer Participants (Participaciones de Clientes)](docs/customer_participants.md)
   - [Products Unavailable (Productos No Disponibles)](docs/product_unavailable.md)
   - [Products Unavailable Log (Histórico de Productos No Disponibles)](docs/product_unavailable_log.md)
   - [Stock Entries (Entradas de Stock)](docs/stock_entries.md)
   - [Error Log (Histórico de Errores)](docs/error_log.md)

---

### 💡 Función de cada tabla

| Tabla                                  | Función / Explicación breve                                                                     |
|----------------------------------------|-------------------------------------------------------------------------------------------------|
| Sites                                  | Identifica cada cliente o tenant en el sistema multiempresa.                                    |
| Users      | Guarda la información y permisos principales de cada usuario, permitiendo roles globales y gestión multi-site mediante la tabla intermedia `user_sites`. |
| User Sites | Relaciona usuarios con uno o varios sites (clientes/tenants), permitiendo controlar a qué empresas tiene acceso cada usuario de forma flexible.           || Brands                                 | Catálogo de marcas gestionadas por cada cliente.                                                |
| Actions Categories                     | Clasifica las acciones comerciales en categorías o familias.                                    |
| Actions Priority Types                 | Define niveles de prioridad para las acciones o campañas.                                       |
| Actions Category Costs                 | Costes o tarifas asignados a cada categoría de acción comercial.                                |
| Actions                                | Define campañas, promociones o acciones comerciales aplicables a pedidos y productos.           |
| Customers                              | Almacena los datos principales, fiscales y de contacto de los clientes.                         |
| Customers Marked Types                 | Clasificación interna de clientes (VIP, bloqueado, etc.).                                       |
| Customers RNVP Types                   | Tipos de restricción para no contactar a clientes (Robinson, NPAI, etc.).                       |
| Correspondence                         | Historial de cartas, notificaciones y otras comunicaciones con el cliente.                      |
| Order Payments Card Types              | Catálogo de tipos de tarjetas admitidas en pagos.                                               |
| Order Payments                         | Guarda todos los pagos asociados a un pedido (efectivo, cheque, tarjeta, aplazado), permitiendo trazabilidad y control de impagos y fraccionamientos. |
| Order Payment Schedules                | Detalla cada uno de los plazos/fracciones de los pagos aplazados, con su importe, fecha y estado, vinculado a un pago principal.                   |
| Orders                                 | Cabecera de cada pedido; agrupa la información principal y referencias al cliente.              |
| Order Addresses                        | Direcciones de envío y facturación asociadas a cada pedido.                                     |
| Order Notes                            | Observaciones internas o externas relacionadas con un pedido.                                   |
| Order Items                            | Líneas de pedido: cada producto o servicio solicitado en un pedido.                             |
| Order Item Substitutes                 | Líneas de pedido que han sido sustituidas por otro producto.                                    |
| Packaging                              | Tipos y formatos de embalaje definidos y sus características.                                   |
| Packaging Sites                        | Asignación y control de embalajes disponibles para cada cliente/site.                           |
| Product Substitutes                    | Reglas de sustitución automática entre productos y lógica de stock.                             |
| Product Substitutes Log                | Histórico detallado de sustituciones efectivas realizadas.                                      |
| Products                               | Almacén completo de productos y todos sus atributos clave.                                      |
| Product Bundles                        | Productos agrupados en packs o lotes para venta conjunta.                                       |
| Returns                                | Cabecera de devoluciones de pedidos por parte del cliente.                                      |
| Return Items                           | Productos concretos devueltos dentro de una devolución.                                         |
| Invoicing                              | Datos y estado de la facturación de pedidos.                                                    |
| Invoicing refunds                      | Facturación asociada a abonos o devoluciones.                                                   |
| Frequency                              | Frecuencia o periodicidad utilizada para acciones o informes.                                   |
| VAT yearly                             | Información y cálculos anuales del IVA para el site o cliente.                                  |
| Customers Marked Types                 | Tipos de marcado (flags) internos de cliente, ej: moroso, prioritario, etc.                     |
| Customers RNVP Types                   | Restricciones de contacto legal/reglamentaria según RGPD, etc.                                  |
| Montant                                | Define rangos o tramos de importe por cliente (site), permitiendo gestionar tarifas escalonadas, límites o reglas de negocio basadas en cuantías. |
| Recency | Define rangos de recencia o antigüedad por cliente/site, utilizados para segmentación, reglas de negocio o campañas. |
| Customer Participants | Registra la participación de clientes en campañas, promociones o eventos, relacionando el cliente por su `customer_id` y guardando también el `customer_code` para búsquedas rápidas desde QR u otras integraciones. |
| Products Unavailable      | Almacena productos o referencias no disponibles temporalmente para un cliente/site, con control de cantidad y vigencia. |
| Products Unavailable Log  | Guarda el histórico de cada registro de producto no disponible en pedidos, con referencia, línea y cantidad, para auditoría y trazabilidad. |
| Stock Entries | Registra todas las entradas y movimientos de stock por producto y cliente, vinculando cada registro con su producto y site para trazabilidad, control y auditoría de inventario. |
| Error Log                        | Guarda todas las incidencias y errores producidos en la aplicación, indicando gravedad, usuario, pedido y estado de resolución, para facilitar la depuración y soporte técnico. |

---

## 🧩 Diagrama Entidad-Relación GesPack (PNG)
🗺️ [Diagrama ER completo](docs/ER-Diagram.png)  
_Este diagrama refleja la estructura lógica de la base de datos GesPack, representando todas las tablas funcionales, auxiliares y de catálogo, así como sus relaciones (incluidas claves foráneas compuestas multi-tenant por `site_id`). Es la referencia central para el análisis de integridad referencial, trazabilidad de claves y diseño evolutivo del modelo de datos._

---

## ❓ FAQ y buenas prácticas

### ¿Qué hacer si añado una nueva tabla?
- Añade siempre el campo `site_id` como clave foránea si la tabla es multi-tenant.
- Usa nombres en inglés y `snake_case` para todos los campos y tablas.
- Añade los campos de auditoría: `created_by`, `created_at`, `updated_by`, `updated_at`.
- Actualiza el listado y la tabla de explicación en este README.
- Crea el archivo `.md` de documentación detallada en la carpeta `docs/`.

### ¿Cómo nombro un campo nuevo?
- Utiliza siempre inglés y formato `snake_case`.
- Si es FK, usa el mismo nombre que en la tabla referenciada.
- Prefiere nombres cortos y descriptivos: `order_id`, `customer_code`, `is_active`, etc.

---

## 🚀 Scripts de migración y despliegue

- Encuentra el script principal aquí:  
  [`Z-Deploy-PGAdmin.psql`](../../../postgresql/Consultas%20CREATE%20para%20PostgreSQL/Z-Deploy-PGAdmin.psql)
- Otros scripts de migración, actualización y utilidades están en la carpeta `scripts/` (en el directorio raíz del proyecto).

---

## ⚠️ Compatibilidad

> **Este proyecto está validado para PostgreSQL 16.x**  
> Si usas otra versión, revisa las restricciones de tipos de dato, índices e instrucciones específicas.  
> No garantizado el funcionamiento en versiones anteriores a 15.x.

---

## 🛠️ Contacto y mantenimiento

- **Responsable del modelo:** Iván López
- **Email soporte:** ilopez@parcelontime.es
- **Para sugerencias o incidencias:** abre un issue en el repositorio o contacta al responsable.

---

## 📄 Licencia

Este proyecto y su documentación son propiedad exclusiva de Parcel On Time S.R.L.
Queda prohibida la copia, reproducción o distribución total o parcial sin el consentimiento expreso del titular.
© 2024 Iván / Parcel On Time S.R.L. – Todos los derechos reservados.
