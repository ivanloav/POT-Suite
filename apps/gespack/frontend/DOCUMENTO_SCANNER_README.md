# 📄 Sistema de Carga Automática de Documentos Escaneados

## 🎯 **Funcionalidades implementadas**

### 1. **Carga automática desde directorio**
- Configura una vez el directorio donde tu escáner guarda los archivos
- La app buscará automáticamente el archivo más reciente
- Renombra automáticamente con el formato: `{referencia-pedido}_{timestamp}.{extension}`

### 2. **Drag & Drop inteligente**
- Arrastra archivos desde cualquier ubicación
- Renombrado automático
- Soporte para PDF, JPG, PNG

### 3. **Integración completa**
- Envío del archivo junto con los datos del pedido
- Notificaciones de éxito/error
- Interface integrada en el formulario de creación

## 🚀 **Cómo usar**

### **Configuración inicial (una sola vez):**

1. **Abre el formulario de crear pedido**
2. **Busca la sección "Documento escaneado"**
3. **Haz clic en "🔧 Configurar directorio de escaneo"**
4. **Selecciona la carpeta donde tu escáner guarda los archivos**

### **Uso diario:**

#### **Opción A: Automática**
1. Escanea el documento (se guarda en la carpeta configurada)
2. En el formulario, haz clic en "🔍 Buscar automáticamente"
3. ¡Listo! El archivo se carga y renombra automáticamente

#### **Opción B: Manual**
1. Arrastra el archivo escaneado a la zona marcada
2. O haz clic en la zona para seleccionar el archivo
3. Se renombra automáticamente

## 🔧 **Configuración del backend**

El backend debe ser modificado para recibir archivos. Ejemplo en NestJS:

```typescript
// orders.controller.ts
@Post()
@UseInterceptors(FileInterceptor('scannedDocument'))
async createOrder(
  @Body() createOrderDto: CreateOrderDto,
  @UploadedFile() scannedDocument?: Express.Multer.File,
) {
  // Si viene orderData como string, parsearlo
  if (typeof createOrderDto === 'string') {
    createOrderDto = JSON.parse(createOrderDto);
  }
  
  return this.ordersService.create(createOrderDto, scannedDocument);
}
```

```typescript
// orders.service.ts
async create(createOrderDto: CreateOrderDto, scannedDocument?: Express.Multer.File) {
  // Crear el pedido
  const order = await this.ordersRepository.save(createOrderDto);
  
  // Si hay archivo, guardarlo
  if (scannedDocument) {
    const fileName = scannedDocument.originalname;
    const filePath = path.join('uploads/orders', fileName);
    
    // Guardar archivo
    await fs.writeFile(filePath, scannedDocument.buffer);
    
    // Actualizar pedido con la ruta del archivo
    order.scannedDocumentPath = filePath;
    await this.ordersRepository.save(order);
  }
  
  return order;
}
```

## 🔍 **Compatibilidad**

- **Navegadores soportados**: Chrome, Edge (para carga automática)
- **Fallback**: Firefox, Safari (solo drag & drop manual)
- **Formatos soportados**: PDF, JPG, PNG
- **Escáneres**: Cualquiera que guarde archivos en una carpeta local

## 📋 **Próximas mejoras**

- [ ] Integración directa con escáneres TWAIN
- [ ] Previsualización del documento antes de enviar
- [ ] Múltiples archivos por pedido
- [ ] OCR automático para extraer datos del documento
- [ ] Compresión automática de imágenes grandes

## 🛠 **Archivos creados**

- `hooks/useDocumentScanner.ts` - Hook principal para la funcionalidad
- `components/orders/DocumentUploader.tsx` - Componente de interfaz
- `components/orders/DocumentUploader.css` - Estilos
- Modificado `api/orders.ts` - Soporte para archivos en el API
- Modificado `CreateOrderForm.tsx` - Integración en el formulario

## 💡 **Consejos de uso**

1. **Configura el directorio una sola vez** y úsalo siempre
2. **Escanea con nombres consistentes** para facilitar la identificación
3. **Usa resolución media** (300 DPI) para equilibrar calidad y tamaño
4. **Mantén la carpeta limpia** para que la búsqueda automática sea más eficiente