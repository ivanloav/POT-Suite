# Scripts de Generación de Plantillas Excel

Esta carpeta contiene scripts para generar plantillas de ejemplo en formato Excel para importación masiva de datos.

## Scripts Disponibles

### 1. `create-os-template.js`
Genera una plantilla de ejemplo para importar versiones de sistemas operativos.

**Uso:**
```bash
node scripts/templates/create-os-template.js
```

**Salida:** `files/os-versions-template.xlsx`

**Contenido:**
- **Hoja 1 "OS Versions"**: 5 ejemplos de versiones de SO (Windows, macOS, Linux, Android, iOS)
- **Hoja 2 "OS Families"**: Lista de familias de SO disponibles

**Campos:**
- `OS Family` (requerido): Nombre de la familia del sistema operativo
- `Name` (requerido): Nombre de la versión específica
- `Is Active` (opcional): Estado activo/inactivo (Sí/No)

---

### 2. `create-assets-template.js`
Genera una plantilla de ejemplo para importar activos de IT.

**Uso:**
```bash
node scripts/templates/create-assets-template.js
```

**Salida:** `files/assets-template.xlsx`

**Contenido:**
- **Hoja 1 "Assets"**: 3 ejemplos de activos (Laptop, Desktop, Mobile)
- **Hoja 2 "Instructions"**: Descripción detallada de cada campo

**Campos:**
- `Site ID` (requerido): ID de la sede
- `Asset Tag` (requerido): Etiqueta única del activo
- `Type ID` (requerido): ID del tipo de activo
- `Model ID` (opcional): ID del modelo
- `OS Version ID` (opcional): ID de la versión del SO
- `Section ID` (opcional): ID de la sección/ubicación
- `Serial` (opcional): Número de serie
- `MAC Address` (opcional): Dirección MAC
- `IP Address` (opcional): Dirección IP
- `Status ID` (opcional): ID del estado (1=Stock, 2=Asignado, 3=Reparación, 4=Retirado)
- `Purchase Date` (opcional): Fecha de compra (YYYY-MM-DD)
- `Warranty End` (opcional): Fecha fin de garantía (YYYY-MM-DD)
- `Location` (opcional): Ubicación física
- `Notes` (opcional): Notas adicionales

---

### 3. `create-employees-template.js`
Genera una plantilla de ejemplo para importar empleados.

**Uso:**
```bash
node scripts/templates/create-employees-template.js
```

**Salida:** `files/employees-template.xlsx`

**Contenido:**
- **Hoja 1 "Employees"**: 3 ejemplos de empleados
- **Hoja 2 "Instructions"**: Descripción detallada de cada campo

**Campos:**
- `Site ID` (requerido): ID de la sede
- `First Name` (requerido): Nombre del empleado
- `Last Name` (requerido): Primer apellido
- `Second Last Name` (opcional): Segundo apellido
- `Email` (opcional): Correo electrónico (único)
- `Phone` (opcional): Teléfono de contacto
- `Is Active` (opcional): true o false (por defecto: true)
- `Notes` (opcional): Notas adicionales o comentarios

---

## Notas Importantes

### Formato de Fechas
- Usar formato **YYYY-MM-DD** (ej: 2024-01-15)
- Excel puede convertir fechas automáticamente a números seriales
- El backend puede interpretar tanto formatos de texto como seriales de Excel

### IDs de Catálogos
Los IDs hacen referencia a registros en las tablas maestras:
- **Site ID**: Tabla `sites`
- **Type ID**: Tabla `asset_types`
- **Model ID**: Tabla `asset_models`
- **OS Version ID**: Tabla `os_versions`
- **Section ID**: Tabla `sections`
- **Status ID**: Tabla `asset_statuses`

### Validaciones
- Los campos marcados como "requeridos" deben estar presentes
- Los IDs deben existir en las tablas correspondientes
- Las etiquetas de activos (`Asset Tag`) deben ser únicas por sede
- Las direcciones MAC deben tener formato válido (XX:XX:XX:XX:XX:XX)

### Regeneración de Plantillas
Ejecutar estos scripts sobrescribirá las plantillas existentes en `files/`.
Es recomendable regenerarlas antes de distribuirlas a usuarios finales para asegurar que los datos de ejemplo sean actuales.

---

## Agregar Nuevas Plantillas

Para crear un nuevo script de plantilla:

1. Crear un archivo `create-[entidad]-template.js`
2. Usar la librería `xlsx` para generar el Excel
3. Incluir:
   - Ejemplos realistas en la primera hoja
   - Instrucciones/catálogos en hojas adicionales
   - Ajuste de ancho de columnas para mejor legibilidad
4. Guardar en `files/[entidad]-template.xlsx`
5. Actualizar este README

**Ejemplo básico:**
```javascript
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const examples = [
  { 'Field 1': 'Value 1', 'Field 2': 'Value 2' },
];

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(examples);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Examples');

worksheet['!cols'] = [{ wch: 15 }, { wch: 20 }];

const outputPath = path.join(__dirname, '../../files/template-name.xlsx');
XLSX.writeFile(workbook, outputPath);
console.log('✅ Plantilla creada:', outputPath);
```
