---
title: Sistema de Importación/Exportación Excel
sidebar_label: Excel Import/Export
---

# Sistema de Importación/Exportación Excel

IT Inventory incluye un sistema completo de importación y exportación de datos mediante archivos Excel, permitiendo la carga masiva de información y la generación de reportes.

## 📋 Características Principales

✅ **Exportación Universal**: Todos los módulos soportan exportación a Excel
✅ **Plantillas Automáticas**: Descarga plantillas pre-configuradas para importación
✅ **Validación de Datos**: Validación automática al importar
✅ **Manejo de Duplicados**: Sistema de 2 pasos para gestionar registros duplicados
✅ **Auditoría**: Rastrea quién importó/exportó datos y cuándo
✅ **Formatos Soportados**: `.xlsx` y `.xls`

---

## 🔄 Flujo de Importación

### Paso 1: Descargar Plantilla

Cada módulo proporciona una plantilla Excel con:
- Columnas requeridas
- Formato esperado
- Ejemplos de datos
- Validaciones de campo

```http
GET /api/{module}/template/excel
Authorization: Bearer {token}
```

**Ejemplo de plantilla (Assets):**
| serial_number | asset_tag | type_id | brand_id | model_id | site_id | status_id | notes |
|---------------|-----------|---------|----------|----------|---------|-----------|-------|
| SN001         | AT001     | 1       | 2        | 5        | 1       | 1         | ...   |

### Paso 2: Completar Datos

- Rellena las columnas requeridas
- Respeta los tipos de datos
- Usa IDs válidos para relaciones
- No modifiques los headers

### Paso 3: Importar Archivo

```http
POST /api/{module}/import/excel
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [archivo.xlsx]
```

### Paso 4a: Importación Exitosa

**Response cuando no hay duplicados:**
```json
{
  "success": true,
  "message": "Importación completada exitosamente",
  "data": {
    "insertados": 50,
    "duplicados": 0,
    "errores": []
  }
}
```

### Paso 4b: Manejo de Duplicados

**Response cuando hay duplicados:**
```json
{
  "success": false,
  "message": "Se encontraron registros duplicados",
  "data": {
    "insertados": 45,
    "duplicados": [
      {
        "fila": 3,
        "dato": "SN001",
        "razon": "El serial number ya existe",
        "existente": {
          "id": 123,
          "serialNumber": "SN001",
          "assetTag": "AT-OLD",
          "brand": "Dell"
        },
        "nuevo": {
          "serialNumber": "SN001",
          "assetTag": "AT001",
          "brand": "Dell"
        }
      }
    ],
    "errores": [
      {
        "fila": 10,
        "campo": "type_id",
        "valor": "999",
        "razon": "El tipo de activo no existe"
      }
    ]
  }
}
```

### Paso 5: Resolver Duplicados (Opcional)

Si hay duplicados, el usuario puede decidir:

**Opción A: Ignorar duplicados** (mantener datos existentes)

**Opción B: Actualizar duplicados** (sobrescribir con nuevos datos)

```http
POST /api/{module}/update-duplicates-excel
Authorization: Bearer {token}
Content-Type: application/json

{
  "duplicates": [
    {
      "fila": 3,
      "dato": "SN001",
      "existente": { "id": 123, ... },
      "nuevo": { "serialNumber": "SN001", ... }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Duplicados actualizados correctamente",
  "data": {
    "actualizados": 5
  }
}
```

---

## 📤 Flujo de Exportación

### Exportar Datos a Excel

```http
GET /api/{module}/export/excel
Authorization: Bearer {token}
```

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="assets_export_2024-01-31.xlsx"`
- Body: Archivo Excel binario

### Características de Exportación

✅ **Filtros Aplicados**: Respeta filtros activos (site, estado, tipo, etc.)
✅ **Datos Completos**: Incluye datos de relaciones (nombres, no solo IDs)
✅ **Formato Legible**: Headers en español, formatos de fecha localizados
✅ **Sin Límites**: Exporta todos los registros (con filtros aplicados)

**Ejemplo de Excel exportado (Assets):**
| ID  | Serial Number | Asset Tag | Tipo    | Marca | Modelo        | Site   | Estado | Creado     |
|-----|---------------|-----------|---------|-------|---------------|--------|--------|------------|
| 1   | SN001         | AT001     | Laptop  | Dell  | Latitude 5520 | Madrid | Activo | 15/01/2024 |
| 2   | SN002         | AT002     | Desktop | HP    | EliteDesk 800 | Madrid | Activo | 16/01/2024 |

---

## 🔧 Módulos con Import/Export

### ✅ Módulos Implementados

| Módulo | Plantilla | Importar | Exportar | Duplicados |
|--------|-----------|----------|----------|------------|
| Assets | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | ✅ | ✅ | ✅ |
| Assignments | ✅ | ✅ | ✅ | ❌ |
| Sites | ✅ | ✅ | ✅ | ❌ |
| Asset Brands | ✅ | ✅ | ✅ | ✅ |
| Asset Models | ✅ | ✅ | ✅ | ✅ |
| Asset Types | ✅ | ✅ | ✅ | ✅ |
| Asset Statuses | ✅ | ✅ | ✅ | ✅ |
| OS Families | ✅ | ✅ | ✅ | ✅ |
| OS Versions | ✅ | ✅ | ✅ | ✅ |
| CPUs | ✅ | ✅ | ✅ | ✅ |
| CPU Vendors | ✅ | ✅ | ✅ | ✅ |
| CPU Segments | ✅ | ✅ | ✅ | ✅ |
| RAMs | ✅ | ✅ | ✅ | ✅ |
| RAM Memory Types | ✅ | ✅ | ✅ | ✅ |
| RAM Form Factors | ✅ | ✅ | ✅ | ✅ |
| Storage | ✅ | ✅ | ✅ | ✅ |
| Storage Drive Types | ✅ | ✅ | ✅ | ✅ |
| Storage Interfaces | ✅ | ✅ | ✅ | ✅ |
| Storage Form Factors | ✅ | ✅ | ✅ | ✅ |
| Sections | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ❌ |
| Roles | ✅ | ✅ | ✅ | ❌ |
| Permissions | ✅ | ✅ | ✅ | ❌ |

---

## 💻 Implementación Backend

### Service Pattern

```typescript
// Método de Exportación
async exportToExcel(): Promise<Buffer> {
  const data = await this.repository.find({
    relations: ['brand', 'model', 'type', 'status', 'site', 'creator', 'updater'],
    order: { id: 'ASC' }
  });

  const workbook = XLSX.utils.book_new();
  
  const excelData = data.map(item => ({
    'ID': item.id,
    'Serial Number': item.serialNumber,
    'Asset Tag': item.assetTag,
    'Tipo': item.type?.name || '',
    'Marca': item.brand?.name || '',
    'Modelo': item.model?.name || '',
    'Site': item.site?.name || '',
    'Estado': item.status?.name || '',
    'Creado': item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-ES') : '',
    'Creado Por': item.creator?.userName || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Método de Plantilla
async generateTemplate(): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Plantilla con headers y ejemplo
  const templateData = [
    {
      'serial_number': 'SN001',
      'asset_tag': 'AT001',
      'type_id': 1,
      'brand_id': 2,
      'model_id': 5,
      'site_id': 1,
      'status_id': 1,
      'notes': 'Ejemplo de activo'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

  // Sheet 2: Datos de referencia (opcional)
  const types = await this.typeRepository.find({ where: { isActive: true } });
  const referenceData = types.map(t => ({ id: t.id, name: t.name }));
  const refSheet = XLSX.utils.json_to_sheet(referenceData);
  XLSX.utils.book_append_sheet(workbook, refSheet, 'Tipos');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Método de Importación
async importFromExcel(
  file: Express.Multer.File, 
  userId: number, 
  siteId: number
): Promise<any> {
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const insertados = [];
  const duplicados = [];
  const errores = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const fila = i + 2; // Excel row (1-indexed + header)

    try {
      // Validar campos requeridos
      if (!row.serial_number) {
        errores.push({
          fila,
          campo: 'serial_number',
          razon: 'Campo requerido'
        });
        continue;
      }

      // Verificar duplicados
      const existing = await this.repository.findOne({
        where: { serialNumber: row.serial_number }
      });

      if (existing) {
        duplicados.push({
          fila,
          dato: row.serial_number,
          razon: 'El serial number ya existe',
          existente: existing,
          nuevo: row
        });
        continue;
      }

      // Crear nuevo registro
      const newAsset = this.repository.create({
        serialNumber: row.serial_number,
        assetTag: row.asset_tag,
        typeId: row.type_id,
        brandId: row.brand_id,
        modelId: row.model_id,
        siteId,
        statusId: row.status_id || 1,
        notes: row.notes,
        createdBy: userId
      });

      const saved = await this.repository.save(newAsset);
      insertados.push(saved);

    } catch (error) {
      errores.push({
        fila,
        campo: 'general',
        razon: error.message
      });
    }
  }

  return {
    insertados: insertados.length,
    duplicados,
    errores
  };
}

// Método para Actualizar Duplicados
async updateDuplicatesFromExcel(duplicates: any[], userId: number): Promise<any> {
  let actualizados = 0;

  for (const dup of duplicates) {
    try {
      await this.repository.update(
        { id: dup.existente.id },
        {
          ...dup.nuevo,
          updatedBy: userId
        }
      );
      actualizados++;
    } catch (error) {
      console.error(`Error actualizando duplicado: ${error.message}`);
    }
  }

  return { actualizados };
}
```

### Controller Endpoints

```typescript
@Controller('assets')
export class AssetsController {
  // Exportar
  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.assetsService.exportToExcel();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="assets_export_${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    res.send(buffer);
  }

  // Plantilla
  @Get('template/excel')
  @UseGuards(JwtAuthGuard)
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetsService.generateTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="assets_template.xlsx"');
    
    res.send(buffer);
  }

  // Importar
  @Post('import/excel')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    const result = await this.assetsService.importFromExcel(
      file,
      req.user.userId,
      req.user.siteId
    );

    if (result.duplicados.length > 0) {
      return {
        success: false,
        message: 'Se encontraron registros duplicados',
        data: result
      };
    }

    return {
      success: true,
      message: 'Importación completada exitosamente',
      data: result
    };
  }

  // Actualizar duplicados
  @Post('update-duplicates-excel')
  @UseGuards(JwtAuthGuard)
  async updateDuplicates(
    @Body() body: { duplicates: any[] },
    @Request() req
  ) {
    const result = await this.assetsService.updateDuplicatesFromExcel(
      body.duplicates,
      req.user.userId
    );

    return {
      success: true,
      message: 'Duplicados actualizados correctamente',
      data: result
    };
  }
}
```

---

## 💻 Implementación Frontend

### Service Methods

```typescript
// src/services/assetService.ts
const assetService = {
  // Exportar
  async exportToExcel() {
    const response = await api.get('/assets/export/excel', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `assets_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Plantilla
  async downloadTemplate() {
    const response = await api.get('/assets/template/excel', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assets_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Importar
  async importFromExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/assets/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  },

  // Actualizar duplicados
  async updateDuplicatesFromExcel(duplicates: any[]) {
    const response = await api.post('/assets/update-duplicates-excel', {
      duplicates
    });
    
    return response.data;
  }
};
```

### Component Pattern

```tsx
// src/pages/AssetsPage.tsx
const AssetsPage = () => {
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exportar
  const handleExport = async () => {
    try {
      await assetService.exportToExcel();
      toast.success('Datos exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar datos');
    }
  };

  // Descargar plantilla
  const handleDownloadTemplate = async () => {
    try {
      await assetService.downloadTemplate();
      toast.success('Plantilla descargada');
    } catch (error) {
      toast.error('Error al descargar plantilla');
    }
  };

  // Importar
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await assetService.importFromExcel(file);

      if (result.success) {
        toast.success(`${result.data.insertados} registros importados`);
        refetch(); // Recargar datos
      } else {
        // Hay duplicados
        setDuplicates(result.data.duplicados);
        setShowDuplicatesModal(true);
        toast.warning(`${result.data.insertados} insertados, ${result.data.duplicados.length} duplicados encontrados`);
      }
    } catch (error) {
      toast.error('Error al importar archivo');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Actualizar duplicados
  const handleUpdateDuplicates = async () => {
    try {
      await assetService.updateDuplicatesFromExcel(duplicates);
      toast.success('Duplicados actualizados');
      setShowDuplicatesModal(false);
      refetch();
    } catch (error) {
      toast.error('Error al actualizar duplicados');
    }
  };

  return (
    <div>
      {/* Header con botones */}
      <div className="flex gap-3">
        <ActionButton variant="export" onClick={handleExport}>
          Exportar
        </ActionButton>
        <ActionButton variant="import" onClick={handleDownloadTemplate}>
          Plantilla
        </ActionButton>
        <ActionButton variant="import" onClick={() => fileInputRef.current?.click()}>
          Importar
        </ActionButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>

      {/* Modal de duplicados */}
      {showDuplicatesModal && (
        <DuplicatesModal
          duplicates={duplicates}
          onUpdate={handleUpdateDuplicates}
          onCancel={() => setShowDuplicatesModal(false)}
        />
      )}
    </div>
  );
};
```

---

## ⚠️ Consideraciones Importantes

### Validaciones

✅ **Tipos de Archivo**: Solo `.xlsx` y `.xls`
✅ **Tamaño Máximo**: 10 MB por archivo
✅ **Campos Requeridos**: Validación en backend
✅ **Referencias**: IDs deben existir en la BD
✅ **Formato de Fechas**: `DD/MM/YYYY` o ISO

### Performance

- Importaciones grandes (>1000 registros) pueden tardar
- Considerar procesar en chunks de 500 registros
- Mostrar progress bar para importaciones largas
- Timeout adecuado en requests (30-60 segundos)

### Seguridad

✅ **Autenticación**: Requiere JWT válido
✅ **Permisos**: Validar permisos de crear/actualizar
✅ **Site**: Filtrar por site del usuario
✅ **Sanitización**: Limpiar inputs antes de guardar

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| "Campo requerido" | Columna vacía | Completar datos obligatorios |
| "ID no existe" | Relación inválida | Verificar IDs en tabla de referencia |
| "Duplicado" | Registro existente | Usar update-duplicates o cambiar dato |
| "Formato inválido" | Tipo de dato incorrecto | Revisar formato en plantilla |

---

## 📖 Recursos Relacionados

- [Guía de Usuario: Importación Masiva](../user/excel-import-guide.md)
- [API Reference: Import/Export Endpoints](./api-reference.md#importexport)
- [Manejo de Errores](./error-handling.md)

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo importar más de 1000 registros a la vez?**
R: Sí, pero el proceso puede tardar varios segundos. Considera dividir en archivos más pequeños.

**P: ¿Qué pasa con los duplicados si no los actualizo?**
R: Se ignoran y se mantienen los datos existentes en la base de datos.

**P: ¿Puedo exportar con filtros aplicados?**
R: Sí, la exportación respeta los filtros activos en la página.

**P: ¿Los IDs en la plantilla son obligatorios?**
R: Para referencias (type_id, brand_id, etc.) sí. Para el ID principal, no (se genera automáticamente).

**P: ¿Qué formato de fecha debo usar?**
R: Preferiblemente `DD/MM/YYYY` o formato ISO `YYYY-MM-DD`.
