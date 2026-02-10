# Funcionalidades del Sistema

IT Inventory es un sistema completo de gestión de inventario IT que te permite controlar todos los activos tecnológicos de tu organización.

## Gestión de Activos

### Registro de Activos

El sistema permite registrar diversos tipos de equipos IT:

- **Laptops:** Portátiles para trabajo móvil
- **Desktops:** Computadoras de escritorio
- **Móviles:** Smartphones corporativos
- **PDAs:** Dispositivos de captura de datos
- **Tablets:** Tabletas para trabajo en campo
- **Monitores:** Pantallas adicionales
- **Periféricos:** Teclados, ratones, webcams, etc.
- **Servidores:** Equipos de infraestructura

### Información de Cada Activo

Para cada activo se registra:

- **Tag del Activo:** Identificador único interno
- **Número de Serie:** Identificador del fabricante
- **Tipo y Modelo:** Categoría y modelo específico
- **Especificaciones:** CPU, RAM, almacenamiento, etc.
- **Sistema Operativo:** SO instalado y versión
- **Fechas:** Compra, garantía, última actualización
- **Estado:** Activo, en reparación, retirado
- **Ubicación:** Almacén, oficina, asignado
- **Notas:** Observaciones y detalles adicionales

### Estados del Activo

Un activo puede tener diferentes estados:

- **Disponible:** Listo para ser asignado
- **Asignado:** Actualmente en uso por un empleado
- **En Reparación:** En mantenimiento o reparación
- **Retirado:** Dado de baja del inventario
- **En Tránsito:** En proceso de transferencia

## Gestión de Empleados

### Directorio de Personal

Mantén un registro completo de tu personal:

- **Datos Personales:** Nombre completo, email corporativo
- **Información Laboral:** Departamento, puesto, fecha de ingreso
- **Estado:** Activo, inactivo, en licencia
- **Equipos Asignados:** Lista de activos actualmente en uso
- **Historial:** Registro de todas las asignaciones previas

## Sistema de Asignaciones

### Asignar Equipos

Proceso simple para asignar activos:

1. Selecciona el activo disponible
2. Selecciona el empleado receptor
3. Registra la fecha de entrega
4. Añade notas sobre la entrega
5. Confirma la asignación

### Devolución de Equipos

Cuando un empleado devuelve un equipo:

1. Busca la asignación activa
2. Registra la devolución
3. Indica el estado del equipo
4. Añade observaciones
5. El equipo vuelve a estar disponible

### Historial de Asignaciones

Para auditoría y seguimiento, el sistema guarda:

- Fechas de asignación y devolución
- Empleado asignado en cada periodo
- Estado del equipo en cada transacción
- Notas y observaciones

## Control de Acceso y Seguridad

### Sistema de Roles

Tres niveles de acceso:

**Viewer (Visualizador):**
- ✅ Ver inventario de activos
- ✅ Consultar información de empleados
- ✅ Ver asignaciones
- ❌ No puede modificar datos

**IT (Técnico):**
- ✅ Todo lo del Viewer
- ✅ Crear y editar activos
- ✅ Gestionar asignaciones
- ✅ Actualizar catálogos
- ❌ No puede gestionar usuarios

**Admin (Administrador):**
- ✅ Acceso completo
- ✅ Gestionar usuarios y roles
- ✅ Configuración del sistema
- ✅ Ver todas las auditorías

### Autenticación Segura

- Login con email y contraseña
- Tokens JWT con expiración configurable
- Sesiones seguras
- Cierre de sesión automático por inactividad

## Reportes y Estadísticas

### Reportes Disponibles

- **Inventario Total:** Lista completa de activos
- **Activos por Tipo:** Distribución por categorías
- **Activos por Estado:** Disponibles, asignados, retirados
- **Asignaciones Activas:** Equipos actualmente en uso
- **Garantías Próximas a Vencer:** Alertas preventivas
- **Historial de Asignaciones:** Por empleado o por activo

### Exportación de Datos

Exporta información a diferentes formatos:

- **Excel (.xlsx):** Para análisis en hojas de cálculo
- **CSV:** Para integración con otros sistemas
- **PDF:** Para reportes impresos

## Funcionalidades Adicionales

### Gestión de Garantías

- Registro de fechas de expiración
- Alertas automáticas antes del vencimiento
- Historial de renovaciones

### Búsqueda Global

Barra de búsqueda universal para encontrar:

- Activos por cualquier campo
- Empleados por nombre o email
- Números de serie
- Tags de activos

### Notificaciones

El sistema te avisa sobre:

- Garantías próximas a vencer
- Asignaciones pendientes
- Cambios importantes en activos
- Alertas del sistema

---

Para más información sobre cómo usar estas funcionalidades, consulta la [Guía de Inicio](/docs/user/getting-started) o las [Preguntas Frecuentes](/docs/user/faq).
