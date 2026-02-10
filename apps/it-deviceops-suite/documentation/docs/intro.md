---
sidebar_position: 1
slug: /
---

# Bienvenido a IT Inventory

Bienvenido a la documentación oficial de **IT Inventory**, el sistema de gestión de inventario IT diseñado para ayudar a tu organización a controlar y administrar todos sus activos tecnológicos.

## ¿Qué es IT Inventory?

IT Inventory es una solución completa que permite:

- 📦 **Gestionar activos IT**: Laptops, desktops, móviles, tablets, servidores y más
- 👥 **Controlar asignaciones**: Saber quién tiene qué equipo en todo momento
- 🔐 **Seguridad y permisos**: Sistema de roles (Admin, IT, Viewer)
- 📊 **Reportes y estadísticas**: Información clara sobre tu inventario
- ⚙️ **Gestión de garantías**: Control de fechas de vencimiento
- 📝 **Historial completo**: Auditoría de todas las asignaciones y cambios

## Navegación Rápida

### 👤 Para Usuarios

Si eres un usuario final del sistema, comienza aquí:

- [🚀 Guía de Inicio](/docs/user/getting-started) - Primeros pasos en el sistema
- [✨ Funcionalidades](/docs/user/features) - Qué puedes hacer con IT Inventory
- [❓ Preguntas Frecuentes](/docs/user/faq) - Respuestas a dudas comunes

### 🛠️ Para Técnicos IT

Si eres parte del equipo técnico o administrador:

- [💻 Instalación](/docs/it/installation) - Cómo instalar y configurar el sistema
- [🏗️ Arquitectura del Sistema](/docs/it/architecture) - Estructura técnica completa
- [🐛 Manejo de Errores](/docs/it/error-handling) - Control de constraints y validaciones
- [🔒 Control de Concurrencia](/docs/it/concurrency-control) - Gestión de operaciones simultáneas
- [🎨 Patrones de UI](/docs/it/ui-patterns) - Guía de componentes frontend
- [🔧 Resolución de Problemas](/docs/it/troubleshooting) - Solución a problemas comunes
- [📡 Referencia de API](/docs/it/api-reference) - Documentación completa de la API REST

## Características Principales

### 🎯 Gestión de Activos

- Registro detallado de equipos IT
- Tags y números de serie únicos
- Estados: Disponible, Asignado, En reparación, Retirado
- Búsqueda y filtros avanzados

### 👥 Control de Asignaciones

- Asignar equipos a empleados
- Registrar devoluciones
- Historial completo de movimientos
- Auditoría de todos los cambios

### 🔐 Seguridad

- Autenticación JWT
- Control de acceso basado en roles (RBAC)
- Tres niveles: Admin, IT, Viewer
- Sesiones seguras

### 📊 Reportes

- Inventario completo
- Activos por tipo y estado
- Asignaciones activas
- Garantías próximas a vencer
- Exportación a Excel/CSV

## Stack Tecnológico

- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Autenticación**: JWT con sistema de roles y permisos
- **Base de Datos**: PostgreSQL 14+

## Requisitos del Sistema

- Node.js 18 o superior
- PostgreSQL 14 o superior
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## Soporte

¿Necesitas ayuda? Consulta:

1. La [sección de usuario](/docs/user/getting-started) para guías de uso
2. La [sección técnica](/docs/it/troubleshooting) para problemas técnicos
3. Las [Preguntas Frecuentes](/docs/user/faq) para respuestas rápidas

---

**¡Comienza ahora!** Explora la documentación usando el menú lateral o los enlaces de navegación rápida arriba. 🚀
