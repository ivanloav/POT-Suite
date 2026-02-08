---
title: Guía de Administración
sidebar_label: Administración
---

# Guía de Administración de Usuarios

Esta guía explica cómo gestionar usuarios, roles y permisos en IT Inventory.

## 🔐 Acceso al Módulo de Administración

### Requisitos
Para acceder al módulo de administración necesitas el rol de **Admin** en el site actual.

### Navegación
1. Click en **"Admin"** en el menú lateral
2. Selecciona la sección que deseas gestionar:
   - 👥 Usuarios
   - 🔑 Roles
   - 🛡️ Permisos

---

## 👥 Gestión de Usuarios

### Ver Lista de Usuarios

La página muestra todos los usuarios del sistema con:
- Nombre de usuario
- Email
- Nombre completo
- Estado (Activo/Inactivo)
- Sites asignados
- Roles por site

### Crear Nuevo Usuario

1. **Click en "+ Crear Usuario"**
2. **Completar datos básicos:**
   - Nombre de usuario (único, sin espacios)
   - Email (único, válido)
   - Contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
   - Nombre
   - Apellido
   - Estado: Activo

3. **Asignar Sites:**
   - Selecciona uno o más sites a los que tendrá acceso
   - Un usuario puede estar en múltiples sites

4. **Asignar Roles por Site:**
   - Para cada site seleccionado, elige un rol:
     - **Admin**: Acceso completo
     - **IT**: Gestión de activos y asignaciones
     - **Viewer**: Solo lectura
   
5. **Click en "Crear Usuario"**

### Editar Usuario

1. Click en el nombre del usuario en la tabla
2. Click en "✏️ Editar" en el header del modal
3. Puedes modificar:
   - Nombre y apellido
   - Email
   - Estado (Activo/Inactivo)
   - Sites asignados
   - Roles por site
4. Click en "💾 Guardar"

⚠️ **No puedes cambiar**: Nombre de usuario

### Cambiar Contraseña de Usuario

1. Abrir modal del usuario
2. Click en "Cambiar Contraseña"
3. Introducir nueva contraseña (mínimo 8 caracteres)
4. Confirmar

### Desactivar Usuario

1. Editar usuario
2. Cambiar toggle "Activo" a OFF
3. Guardar cambios

El usuario no podrá hacer login hasta que se reactive.

### Exportar/Importar Usuarios

**Exportar:**
- Click en "Exportar" para descargar Excel con todos los usuarios

**Importar:**
1. Click en "Plantilla" para descargar formato
2. Completar Excel con datos de usuarios
3. Click en "Importar" y seleccionar archivo
4. Revisar y confirmar importación

---

## 🔑 Gestión de Roles

### Roles del Sistema (No Editables)

IT Inventory incluye 3 roles predefinidos:

#### 1. Admin
- **Acceso**: Completo
- **Permisos**: Todos
- **Puede**: Crear, editar, eliminar todo
- **Uso**: Administradores del sistema

#### 2. IT
- **Acceso**: Gestión operativa
- **Permisos**: Activos, Empleados, Asignaciones, Catálogos
- **No puede**: Gestionar usuarios, roles o permisos
- **Uso**: Personal de IT

#### 3. Viewer
- **Acceso**: Solo lectura
- **Permisos**: Ver activos, empleados, asignaciones
- **No puede**: Crear, editar o eliminar nada
- **Uso**: Personal administrativo, reportes

### Crear Rol Personalizado

1. **Click en "+ Crear Rol"**
2. **Completar datos:**
   - Nombre: Ej: "Asset Manager"
   - Código: Ej: "ASSET_MANAGER" (único, mayúsculas)
   - Descripción: Explicación del rol
   - Estado: Activo

3. **Seleccionar Permisos:**
   - Marca los checkboxes de los permisos que tendrá el rol
   - Los permisos están agrupados por módulo:
     - 📦 Activos
     - 👥 Empleados
     - 📋 Asignaciones
     - 📚 Catálogos
     - 🏢 Sites
     - 🔐 Administración

4. **Click en "Crear Rol"**

### Editar Rol Personalizado

1. Click en el nombre del rol
2. Click en "✏️ Editar"
3. Modificar descripción o permisos
4. Click en "💾 Guardar"

⚠️ **Restricciones:**
- No puedes editar roles del sistema (Admin, IT, Viewer)
- No puedes eliminar roles que estén asignados a usuarios

### Ver Permisos de un Rol

1. Click en el nombre del rol
2. Se muestra la lista completa de permisos asignados
3. Agrupados por módulo para fácil lectura

---

## 🛡️ Gestión de Permisos

### Permisos Disponibles

Los permisos siguen el formato: `modulo:accion`

**Acciones comunes:**
- `read`: Ver/Listar
- `create`: Crear nuevo
- `update`: Editar existente
- `delete`: Eliminar
- `export`: Exportar a Excel
- `import`: Importar desde Excel
- `manage`: Gestión completa

**Módulos:**
- `assets`: Activos
- `employees`: Empleados
- `assignments`: Asignaciones
- `catalogs`: Catálogos
- `sites`: Sites
- `users`: Usuarios
- `roles`: Roles
- `permissions`: Permisos

### Ejemplos de Permisos

```
assets:read          → Ver lista de activos
assets:create        → Crear nuevos activos
employees:update     → Editar empleados
catalogs:manage      → Gestión completa de catálogos
users:manage         → Gestión completa de usuarios
```

### Crear Permiso Personalizado

⚠️ **Avanzado**: Crear permisos personalizados requiere también implementación en el código.

1. **Click en "+ Crear Permiso"**
2. **Completar:**
   - Nombre: "Aprobar Activos"
   - Código: "assets:approve"
   - Descripción: Explicación detallada
   - Módulo: "assets"
   - Estado: Activo

3. **Click en "Crear Permiso"**

4. **Implementación requerida:**
   - Backend: Agregar validación en controladores
   - Frontend: Agregar condiciones en componentes

---

## 🎯 Casos de Uso Comunes

### Caso 1: Nuevo Empleado de IT

**Necesita:**
- Gestionar activos y asignaciones
- Sin acceso a administración

**Pasos:**
1. Crear usuario con datos básicos
2. Asignar al site correspondiente
3. Asignar rol **IT**
4. El usuario puede:
   - ✅ Ver, crear, editar activos
   - ✅ Gestionar asignaciones
   - ✅ Gestionar catálogos
   - ❌ Crear usuarios
   - ❌ Modificar roles

---

### Caso 2: Gerente de Múltiples Oficinas

**Necesita:**
- Acceso total en su oficina principal
- Solo lectura en oficinas secundarias

**Pasos:**
1. Crear usuario
2. Asignar múltiples sites:
   - Site Madrid: Rol **Admin**
   - Site Barcelona: Rol **Viewer**
   - Site Valencia: Rol **Viewer**
3. El usuario:
   - En Madrid: Acceso completo
   - En Barcelona/Valencia: Solo lectura

**Cambio de Site:**
- Al cambiar de site en el selector, los permisos cambian automáticamente

---

### Caso 3: Personal de Reportes

**Necesita:**
- Ver toda la información
- Exportar reportes
- Sin capacidad de modificar

**Opción 1 - Usar rol Viewer:**
- Limitación: No puede exportar

**Opción 2 - Crear rol "Reporter":**
1. Crear nuevo rol "Reporter"
2. Asignar permisos:
   - `assets:read`
   - `assets:export`
   - `employees:read`
   - `employees:export`
   - `assignments:read`
   - `assignments:export`
3. Asignar rol al usuario

---

### Caso 4: Responsable Solo de Activos

**Necesita:**
- Gestión completa de activos
- Sin acceso a empleados ni administración

**Pasos:**
1. Crear rol "Asset Manager"
2. Asignar permisos:
   - `assets:read`
   - `assets:create`
   - `assets:update`
   - `assets:delete`
   - `assets:export`
   - `assets:import`
   - `assignments:read`
   - `assignments:create`
   - `catalogs:read`
3. Asignar rol al usuario

---

## ⚠️ Seguridad y Mejores Prácticas

### 1. Principio de Mínimo Privilegio

✅ **Asigna solo los permisos necesarios**
- Evalúa qué necesita hacer realmente el usuario
- No des acceso "Admin" por defecto

❌ **No asignes permisos innecesarios**
- "Por si acaso" genera riesgos de seguridad

### 2. Contraseñas Seguras

**Requisitos mínimos:**
- 8 caracteres
- 1 letra mayúscula
- 1 letra minúscula
- 1 número

**Recomendaciones:**
- Usa frases de contraseña: `M1Perr0EsMarr0n!`
- Cambia contraseñas periódicamente
- No reutilices contraseñas

### 3. Desactiva Usuarios Inactivos

- No elimines usuarios que ya no trabajan
- **Desactívalos** para mantener auditoría
- Los activos/asignaciones conservan la información histórica

### 4. Revisa Permisos Regularmente

- Audita roles trimestralmente
- Verifica que los usuarios tienen los permisos correctos
- Elimina permisos innecesarios

### 5. Documenta Roles Personalizados

- Escribe descripciones claras
- Explica para qué se usa cada rol
- Facilita el mantenimiento futuro

---

## 🔍 Auditoría

### Información Rastreada

Todos los cambios en usuarios, roles y permisos incluyen:
- **Quién**: Usuario que hizo el cambio
- **Cuándo**: Fecha y hora exacta
- **Qué**: Registro modificado

### Ver Auditoría

En el modal de detalles de cualquier registro:
```
Información del Sistema:
├─ Creado por: juan.perez - 15/01/2024 10:30
└─ Modificado por: maria.garcia - 20/01/2024 14:45
```

---

## 💡 Tips y Trucos

### 1. Usa Nombres Descriptivos para Roles

✅ BIEN: "Asset Manager", "IT Support", "Finance Viewer"
❌ MAL: "Role1", "Custom", "Nuevo"

### 2. Agrupa Permisos Lógicamente

Al crear roles, agrupa permisos relacionados:
```
Rol "Asset Admin":
  ├─ assets:* (todos)
  ├─ assignments:* (todos)
  └─ catalogs:read (solo lectura)
```

### 3. Exporta Configuración Antes de Cambios

Antes de modificaciones masivas:
1. Exporta usuarios
2. Exporta roles
3. Haz los cambios
4. Si hay problemas, tienes un backup

### 4. Prueba Roles Nuevos

Antes de asignar un rol nuevo a muchos usuarios:
1. Créalo
2. Asígnalo a un usuario de prueba
3. Verifica que funciona correctamente
4. Luego asigna masivamente

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo tener el mismo rol en todos mis sites?**
R: Sí, puedes asignar el mismo rol en cada site al crear/editar el usuario.

**P: ¿Qué pasa si olvido mi contraseña?**
R: Contacta con un administrador para que la restablezca.

**P: ¿Puedo ver los permisos de mi propio usuario?**
R: Sí, en tu perfil (icono de usuario → Mi Perfil).

**P: ¿Cuántos roles puede tener un usuario?**
R: Uno por site. Si tienes 3 sites, puedes tener hasta 3 roles diferentes.

**P: ¿Puedo eliminar el rol Admin?**
R: No, los roles del sistema no se pueden eliminar ni modificar.

**P: ¿Qué pasa si desactivo un usuario con activos asignados?**
R: Los activos se mantienen asignados, pero el usuario no puede hacer login.

---

## 📖 Recursos Relacionados

- [RBAC - Documentación Técnica](../it/rbac.md)
- [Multi-Site Architecture](../it/multi-site-architecture.md)
- [FAQ General](./faq.md)

---

## 🆘 Soporte

Para problemas con administración de usuarios:
1. Verifica que tienes rol Admin
2. Consulta esta guía y los FAQs
3. Contacta con el administrador del sistema
