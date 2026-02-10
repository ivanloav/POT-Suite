---
title: Guía de Catálogos
sidebar_label: Catálogos
---

# Guía de Gestión de Catálogos

Los catálogos son el corazón del sistema IT Inventory. Proporcionan la estructura de datos maestra que se utiliza para clasificar y organizar todos los activos.

## 📋 Visión General

IT Inventory incluye **18 catálogos** organizados en 5 categorías:

### 🏷️ **Catálogos Básicos de Activos** (5)
1. **Marcas** (Brands) - Dell, HP, Apple, Lenovo...
2. **Modelos** (Models) - Latitude 5530, ThinkPad X1, MacBook Pro...
3. **Tipos** (Types) - Laptop, Desktop, Mobile, Tablet, Server...
4. **Estados** (Statuses) - Disponible, En Uso, En Reparación...
5. **Secciones** (Sections) - Departamentos/Áreas por site

### 💻 **Catálogos de Sistemas Operativos** (2)
6. **Familias de OS** (OS Families) - Windows, macOS, Linux, Android...
7. **Versiones de OS** (OS Versions) - Windows 11, macOS Sonoma...

### 🔧 **Catálogos de Hardware - CPUs** (3)
8. **Procesadores** (CPUs) - Intel Core i7, AMD Ryzen 9...
9. **Fabricantes de CPU** (CPU Vendors) - Intel, AMD, Apple...
10. **Segmentos de CPU** (CPU Segments) - Desktop, Mobile, Server...

### 💾 **Catálogos de Hardware - RAM** (3)
11. **Memorias RAM** (RAM) - Kingston 16GB DDR5...
12. **Tipos de Memoria** (RAM Memory Types) - DDR3, DDR4, DDR5...
13. **Form Factors de RAM** (RAM Form Factors) - DIMM, SO-DIMM...

### 💿 **Catálogos de Hardware - Storage** (4)
14. **Almacenamiento** (Storage) - Samsung 990 PRO 2TB...
15. **Tipos de Disco** (Storage Drive Types) - HDD, SSD, NVMe...
16. **Interfaces de Storage** (Storage Interfaces) - SATA, NVMe, USB...
17. **Form Factors de Storage** (Storage Form Factors) - 2.5", M.2...

### 🏢 **Gestión de Organización** (1)
18. **Sitios/Sucursales** (Sites) - Oficina Madrid, Sucursal Barcelona...

---

## 🎯 Acceso a los Catálogos

### Desde la Barra Lateral

1. Click en **"Catálogos"** en el menú lateral
2. Se despliega el listado de todos los catálogos organizados por categorías
3. Click en el catálogo específico que deseas gestionar

### Estructura del Menú

```
📦 Catálogos
  ├─ 🏷️ Activos
  │   ├─ Marcas
  │   ├─ Modelos
  │   ├─ Tipos
  │   ├─ Estados
  │   └─ Secciones
  ├─ 💻 Sistemas Operativos
  │   ├─ Familias de OS
  │   └─ Versiones de OS
  ├─ 🔧 Hardware - CPU
  │   ├─ Procesadores
  │   ├─ Fabricantes CPU
  │   └─ Segmentos CPU
  ├─ 💾 Hardware - RAM
  │   ├─ Memorias RAM
  │   ├─ Tipos de Memoria
  │   └─ Form Factors RAM
  └─ 💿 Hardware - Storage
      ├─ Almacenamiento
      ├─ Tipos de Disco
      ├─ Interfaces
      └─ Form Factors
```

---

## 📄 Estructura Común de Páginas

Todas las páginas de catálogos siguen la misma estructura:

### Header con Acciones
```
[Título del Catálogo]    [Refrescar] [Exportar] [Plantilla] [Importar] [+ Crear]
```

**Botones disponibles:**
- **Refrescar**: Recargar datos desde el servidor
- **Exportar**: Descargar datos actuales en Excel
- **Plantilla**: Descargar plantilla para importación masiva
- **Importar**: Subir archivo Excel con datos masivos
- **+ Crear**: Abrir modal para crear nuevo registro

### Tabla de Datos

Columnas comunes en todas las tablas:
- **ID**: Identificador único
- **Columnas específicas** (Nombre, Código, etc.)
- **Estado**: Badge Activo/Inactivo
- **Creado por**: Usuario que creó el registro
- **Creación**: Fecha y hora de creación

### Acciones por Fila

Click en el nombre/código del registro para ver **detalles completos** en un modal.

---

## ✏️ Crear Nuevo Registro

### Pasos:

1. **Click en "+ Crear"** en la esquina superior derecha
2. **Completar formulario** con los datos requeridos
   - Campos con `*` son obligatorios
   - El sistema valida en tiempo real
3. **Click en "Crear [Entidad]"** 
4. El registro aparece inmediatamente en la tabla

### Validaciones Comunes:

❌ **No se permite**:
- Nombres duplicados (en la mayoría de catálogos)
- Códigos duplicados (cuando aplique)
- Campos vacíos en campos requeridos

✅ **Se valida automáticamente**:
- Formato de texto
- Longitud de campos
- Unicidad de códigos

---

## 👁️ Ver Detalles de Registro

### Abrir Modal de Detalles:

1. **Click en el nombre o código** en la tabla
2. Se abre modal en **modo solo lectura**
3. Ver toda la información incluyendo auditoría

### Información Visible:

- Todos los campos del registro
- Estado (Activo/Inactivo)
- Información del sistema:
  - Creado por: [Usuario] - [Fecha]
  - Modificado por: [Usuario] - [Fecha]

### Acciones Disponibles:

**Botones en el header del modal:**
- **✏️ Editar**: Cambiar a modo edición
- **💾 Guardar**: Guardar cambios (solo visible en modo edición)
- **❌ Cancelar**: Cerrar sin guardar o salir de modo edición

---

## ✏️ Editar Registro

### Desde el Modal de Detalles:

1. **Click en "✏️ Editar"** en el header del modal
2. Los campos se vuelven **editables**
3. **Modificar** los datos necesarios
4. **Click en "💾 Guardar"** para confirmar cambios
5. O **Click en "❌ Cancelar"** para descartar cambios

### Campos No Editables:

- ID del registro
- Fechas de creación/modificación
- Usuario creador/modificador

### Toggle de Estado:

En modo edición, puedes cambiar el estado con el **toggle switch**:
```
[Toggle] Activo/Inactivo
```

---

## 📤 Exportar Datos

### Exportación a Excel:

1. **Aplicar filtros** (opcional) - Solo se exportarán registros visibles
2. **Click en "Exportar"**
3. El archivo Excel se descarga automáticamente
4. Nombre del archivo: `[entidad]_export_[fecha].xlsx`

### Contenido del Excel:

- Todas las columnas visibles en la tabla
- Datos de relaciones (nombres, no IDs)
- Formato legible con headers en español
- Fechas en formato local (DD/MM/YYYY)

---

## 📥 Importación Masiva

### Flujo Completo:

#### Paso 1: Descargar Plantilla

1. **Click en "Plantilla"**
2. Se descarga `[entidad]_template.xlsx`
3. Abrir con Excel/LibreOffice/Google Sheets

#### Paso 2: Completar Plantilla

**La plantilla incluye:**
- Headers con nombres de columnas
- Fila de ejemplo con datos
- Hoja adicional con datos de referencia (IDs válidos)

**Reglas importantes:**
- ❌ No modificar nombres de columnas
- ❌ No eliminar la fila de headers
- ✅ Puedes eliminar la fila de ejemplo
- ✅ Agregar tantas filas como necesites
- ✅ Respetar tipos de datos (números, texto, fechas)

#### Paso 3: Importar Archivo

1. **Click en "Importar"**
2. **Seleccionar archivo** `.xlsx` o `.xls`
3. El sistema procesa el archivo

#### Paso 4a: Importación Exitosa

**Si no hay errores:**
```
✅ Importación completada exitosamente
   45 registros insertados
```

#### Paso 4b: Gestión de Duplicados

**Si hay duplicados encontrados:**

Se muestra un **Modal de Duplicados** con:
- Lista de registros duplicados
- Datos existentes vs datos nuevos
- Comparación lado a lado

**Opciones:**
- **Ignorar**: Mantener datos existentes (cerrar modal)
- **Actualizar**: Sobrescribir con datos nuevos (click en "Actualizar Duplicados")

#### Paso 5: Verificar Resultados

Los registros importados aparecen en la tabla inmediatamente.

---

## 🏷️ Catálogos Básicos - Detalles

### 1. Marcas (Asset Brands)

**Campos:**
- Nombre: Dell, HP, Lenovo, Apple...
- Código: DELL, HP, LENOVO, APPLE
- Estado: Activo/Inactivo

**Uso:** Marca del fabricante del activo

**Ejemplo:**
```
Nombre: Dell
Código: DELL
Estado: ✅ Activo
```

---

### 2. Modelos (Asset Models)

**Campos:**
- Nombre: Latitude 5530, ThinkPad X1 Carbon...
- Código: LAT5530, X1CARBON
- Tipo: Laptop, Desktop, etc. (relación con Tipos)
- Marca: Dell, Lenovo, etc. (relación con Marcas)
- Estado: Activo/Inactivo

**Uso:** Modelo específico del activo

**Relaciones:**
- Un modelo pertenece a una marca
- Un modelo pertenece a un tipo

**Ejemplo:**
```
Nombre: Latitude 5530
Código: LAT5530
Tipo: Laptop
Marca: Dell
Estado: ✅ Activo
```

---

### 3. Tipos (Asset Types)

**Campos:**
- Nombre: Laptop, Desktop, Mobile, Tablet, Server...
- Código: LAPTOP, DESKTOP, MOBILE
- Estado: Activo/Inactivo

**Uso:** Categoría principal del activo

**Tipos comunes:**
- Laptop
- Desktop
- Mobile (Smartphone)
- Tablet
- Server
- Monitor
- Printer
- Network Device

---

### 4. Estados (Asset Statuses)

**Campos:**
- Nombre: Disponible, En Uso, En Reparación...
- Código: AVAILABLE, IN_USE, REPAIR
- Orden: Número para ordenar en listados
- Estado: Activo/Inactivo

**Uso:** Estado actual del activo en su ciclo de vida

**Estados comunes:**
- Disponible
- En Uso
- En Reparación
- Retirado
- Perdido
- En Tránsito

---

### 5. Secciones (Sections)

**Campos:**
- Nombre: IT, Ventas, Marketing, RRHH...
- Código: IT, SALES, MKT, HR
- Site: Oficina específica (relación con Sites)
- Orden: Número para ordenar
- Estado: Activo/Inactivo

**Uso:** Departamento o área al que pertenece un empleado

**⚠️ Importante:** Las secciones son **específicas por site**

**Ejemplo:**
```
Nombre: Tecnología
Código: IT
Site: Oficina Madrid
Orden: 1
Estado: ✅ Activo
```

---

## 💻 Catálogos de OS - Detalles

### 6. Familias de OS

**Campos:**
- Nombre: Windows, macOS, Linux, Android...
- Código: WIN, MAC, LINUX, ANDROID
- Color: Color para badges (#hex)
- Estado: Activo/Inactivo

**Uso:** Familia del sistema operativo

**Ejemplos:**
```
Windows → #0078D4 (azul)
macOS → #000000 (negro)
Linux → #FCC624 (amarillo)
Android → #3DDC84 (verde)
```

---

### 7. Versiones de OS

**Campos:**
- Nombre: Windows 11 Pro, macOS Sonoma 14.2...
- Código: WIN11PRO, MACOS14
- Familia: Windows, macOS, etc. (relación con Familias)
- Estado: Activo/Inactivo

**Uso:** Versión específica del sistema operativo instalado

**Relación:** Una versión pertenece a una familia

---

## 🔧 Catálogos de Hardware - Detalles

Ver documentación técnica detallada en:
- [Catálogos de Hardware - CPUs](../it/hardware-catalogs.md#cpus)
- [Catálogos de Hardware - RAM](../it/hardware-catalogs.md#ram)
- [Catálogos de Hardware - Storage](../it/hardware-catalogs.md#storage)

---

## 🏢 Gestión de Sites

Ver guía completa en:
- [Multi-Site Architecture](../it/multi-site-architecture.md)

**Resumen:**
- Un site representa una ubicación física (oficina, sucursal, almacén)
- Los usuarios pueden tener acceso a múltiples sites
- Los activos, empleados y asignaciones pertenecen a un site específico
- Los catálogos (excepto Sections) son globales entre sites

---

## 🎨 Códigos de Colores

### Badges de Estado

| Estado | Color | Visual |
|--------|-------|--------|
| Activo | Verde | 🟢 Activo |
| Inactivo | Gris | ⚫ Inactivo |

### Badges de OS Families

Cada familia de OS tiene su color personalizado definido en el catálogo.

---

## ⚠️ Consideraciones Importantes

### Eliminación de Registros

❌ **No se permite eliminar registros** que estén siendo utilizados por:
- Activos
- Empleados
- Asignaciones
- Otras relaciones

✅ **Alternativa**: Cambiar el estado a "Inactivo"

### Permisos Requeridos

Según tu rol, puedes tener diferentes permisos:
- **Admin**: Crear, editar, eliminar, exportar, importar
- **IT**: Crear, editar, exportar
- **Viewer**: Solo ver (sin exportar)

### Datos de Auditoría

Todos los registros incluyen información de auditoría:
- Quién lo creó y cuándo
- Quién lo modificó por última vez y cuándo
- Esta información NO es editable

---

## 💡 Tips y Mejores Prácticas

### 1. Nomenclatura Consistente

✅ **BIEN:**
- Códigos en mayúsculas: `DELL`, `LAPTOP`, `WIN11`
- Nombres descriptivos: "Dell Latitude 5530"

❌ **MAL:**
- Códigos inconsistentes: `dell`, `Dell`, `DELL`
- Nombres ambiguos: "Laptop Dell"

### 2. Usa Códigos Únicos y Descriptivos

```
✅ BIEN:  LAT5530, X1CARBON, MBP16_M1
❌ MAL:   LAP1, LAP2, LAPTOP001
```

### 3. Mantén Activos Solo los Registros en Uso

Marca como "Inactivo" los registros obsoletos en lugar de eliminarlos.

### 4. Exporta Antes de Importaciones Masivas

Crea un backup exportando antes de hacer cambios masivos.

### 5. Usa la Plantilla Correcta

Siempre descarga la plantilla actual antes de importar datos.

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo eliminar un catálogo que ya no uso?**
R: No puedes eliminar registros en uso. Márcalos como "Inactivo".

**P: ¿Los cambios en catálogos afectan a activos existentes?**
R: Sí, si cambias el nombre de una marca, se reflejará en todos los activos de esa marca.

**P: ¿Puedo importar miles de registros a la vez?**
R: Sí, pero considera dividir en archivos más pequeños (&lt;1000 registros) para mejor performance.

**P: ¿Los catálogos son específicos por site?**
R: No, excepto las Secciones. Todos los demás catálogos son globales.

**P: ¿Qué pasa si importo un registro duplicado?**
R: El sistema te lo notifica y puedes elegir si actualizar o ignorar.

---

## 📖 Recursos Relacionados

- [Excel Import/Export - Guía Técnica](../it/excel-import-export.md)
- [Hardware Catalogs - Documentación Técnica](../it/hardware-catalogs.md)
- [Multi-Site Architecture](../it/multi-site-architecture.md)
- [Control de Errores](../it/error-handling.md)

---

## 🆘 Soporte

Si necesitas ayuda con los catálogos:
1. Consulta la [FAQ](./faq.md)
2. Revisa la [Guía de Inicio](./getting-started.md)
3. Contacta con tu administrador de sistema
