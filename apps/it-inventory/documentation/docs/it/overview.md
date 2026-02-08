---
title: Índice General de Documentación Técnica
sidebar_label: Índice General
---

# Índice General de Documentación Técnica

Este documento proporciona un mapa completo de toda la documentación técnica de IT Inventory.

## 📚 Documentación Principal

### Para Desarrolladores

#### 1. [Arquitectura del Sistema](./architecture.md)
**Descripción**: Visión completa de la arquitectura técnica del sistema.

**Contenido**:
- Estructura del monorepo (backend, frontend, documentation)
- Patrón modular de NestJS
- Arquitectura de entidades TypeORM
- Service-layer architecture del frontend
- Flujo completo de una operación
- Variables de entorno y despliegue

**Cuándo leer**: 
- ✅ Al unirse al equipo de desarrollo
- ✅ Antes de crear un nuevo módulo
- ✅ Para entender la estructura del proyecto

---

#### 2. [Manejo de Errores de Constraints](./error-handling.md)
**Descripción**: Guía completa del sistema de manejo de errores de constraints UNIQUE.

**Contenido**:
- Patrón estándar de try-catch
- 26 servicios actualizados con manejo de errores
- Tabla de referencia de constraints
- Códigos de error PostgreSQL (23505)
- Excepciones HTTP de NestJS
- Beneficios de la implementación

**Cuándo leer**:
- ✅ Al crear un nuevo servicio con constraints UNIQUE
- ✅ Para debuggear errores de duplicados
- ✅ Al implementar validaciones en backend

---

#### 3. [Control de Concurrencia](./concurrency-control.md)
**Descripción**: Estrategias implementadas para manejar operaciones simultáneas.

**Contenido**:
- Constraints UNIQUE como defensa final
- Transacciones automáticas de TypeORM
- Timestamps de auditoría
- Validaciones preventivas
- Escenarios de concurrencia cubiertos
- Mejoras futuras (optimistic/pessimistic locking)
- Monitoreo de conflictos en PostgreSQL

**Cuándo leer**:
- ✅ Para entender cómo el sistema previene duplicados
- ✅ Al investigar problemas de concurrencia
- ✅ Antes de implementar operaciones críticas multi-usuario

---

#### 4. [Patrones de UI y Componentes](./ui-patterns.md)
**Descripción**: Guía de patrones estándar de UI y componentes reutilizables del frontend.

**Contenido**:
- Estructura de página estándar (OBLIGATORIA)
- Componentes reutilizables (ActionButton, DataTable, Modal)
- Patrones de formularios
- Manejo de estado (Zustand + React Query)
- Estilos y clases CSS
- Mejores prácticas

**Cuándo leer**:
- ✅ Antes de crear una nueva página
- ✅ Al implementar un formulario
- ✅ Para mantener consistencia visual

---

#### 5. [Instalación y Configuración](./installation.md)
**Descripción**: Guía paso a paso para instalar y configurar el sistema.

**Contenido**:
- Requisitos previos
- Instalación de base de datos
- Configuración de backend
- Configuración de frontend
- Scripts de inicialización

**Cuándo leer**:
- ✅ Al configurar el entorno de desarrollo
- ✅ Al desplegar en un nuevo servidor
- ✅ Para resolver problemas de configuración

---

#### 6. [Resolución de Problemas](./troubleshooting.md)
**Descripción**: Soluciones a problemas comunes del sistema.

**Contenido**:
- Errores de base de datos
- Problemas de autenticación
- Errores de compilación
- Issues de performance

**Cuándo leer**:
- ✅ Al encontrar un error desconocido
- ✅ Para debugging general
- ✅ Antes de reportar un bug

---

#### 7. [Referencia de API REST](./api-reference.md)
**Descripción**: Documentación completa de todos los endpoints de la API.

**Contenido**:
- Endpoints organizados por módulo
- Request/Response ejemplos
- Códigos de estado HTTP
- Autenticación y permisos requeridos

**Cuándo leer**:
- ✅ Al integrar con la API
- ✅ Para entender endpoints específicos
- ✅ Al desarrollar el frontend

---

## � Referencias

### Documentos Base del Proyecto

Los siguientes archivos markdown en la raíz del proyecto contienen documentación técnica original que sirvió de base para esta documentación:

- **CONTROL_CONCURRENCIA.md** - Documento original sobre control de concurrencia
- **MANEJO_ERRORES_CONSTRAINTS.md** - Documento original sobre manejo de errores
- **backend/ARQUITECTURA.md** - Documento original de arquitectura backend

Estos archivos se mantienen en el proyecto como referencia técnica detallada.

---

## 📖 Guías de Usuario Final

### Para Usuarios del Sistema

#### 1. [Guía de Inicio](../user/getting-started.md)
Primeros pasos para usar IT Inventory como usuario final.

#### 2. [Funcionalidades](../user/features.md)
Descripción completa de todas las funcionalidades del sistema.

#### 3. [Preguntas Frecuentes](../user/faq.md)
Respuestas a dudas comunes de usuarios.

---

## 🔗 Recursos Externos

### Tecnologías Principales

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Librerías Clave

- [React Query (TanStack Query)](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [react-hook-form](https://react-hook-form.com/)
- [class-validator](https://github.com/typestack/class-validator)

---

## 🎯 Rutas de Aprendizaje Recomendadas

### Para Nuevos Desarrolladores Backend

1. [Arquitectura del Sistema](./architecture.md) - Sección Backend
2. [Instalación y Configuración](./installation.md)
3. [Manejo de Errores](./error-handling.md)
4. [Control de Concurrencia](./concurrency-control.md)
5. [API Reference](./api-reference.md)

**Tiempo estimado**: 3-4 horas de lectura + práctica

---

### Para Nuevos Desarrolladores Frontend

1. [Arquitectura del Sistema](./architecture.md) - Sección Frontend
2. [Instalación y Configuración](./installation.md)
3. [Patrones de UI](./ui-patterns.md)
4. [Manejo de Errores](./error-handling.md) - Sección Frontend
5. [API Reference](./api-reference.md)

**Tiempo estimado**: 3-4 horas de lectura + práctica

---

### Para DevOps/Sysadmins

1. [Instalación y Configuración](./installation.md)
2. [Arquitectura del Sistema](./architecture.md) - Secciones Database y Deployment
3. [Resolución de Problemas](./troubleshooting.md)
4. [Control de Concurrencia](./concurrency-control.md) - Sección Monitoreo

**Tiempo estimado**: 2-3 horas de lectura

---

## 📝 Cómo Contribuir a la Documentación

### Agregar Nueva Documentación

1. Crear archivo en `documentation/docs/it/`
2. Usar formato markdown
3. Seguir estructura existente
4. Agregar al `sidebars.ts`
5. Actualizar este índice

### Actualizar Documentación Existente

1. Editar el archivo correspondiente
2. Mantener formato consistente
3. Actualizar fecha de última modificación
4. Notificar al equipo de cambios importantes

### Convenciones de Escritura

- ✅ Usar español para contenido de usuario
- ✅ Incluir ejemplos de código
- ✅ Usar emojis para secciones principales
- ✅ Incluir tablas de referencia rápida
- ✅ Agregar sección "Cuándo leer" en guías técnicas

---

## 🔄 Última Actualización

**Fecha**: Enero 2026  
**Versión de documentación**: 1.0  
**Mantenedores**: Equipo IT Inventory

---

## 📬 Contacto y Soporte

Para preguntas sobre la documentación:
- Abrir issue en el repositorio
- Contactar al equipo de desarrollo
- Proponer mejoras mediante Pull Request

---

**Nota**: Esta documentación es un documento vivo que se actualiza constantemente conforme el sistema evoluciona.
