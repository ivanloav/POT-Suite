# ActionButton Component

Componente reutilizable de botones con estilos consistentes para toda la aplicación.

## Propósito

Proporciona botones pre-estilizados con colores semánticos y soporte para modo oscuro, garantizando una experiencia visual consistente en todas las páginas.

## Importación

```tsx
import { ActionButton } from '@/components/ActionButton';
import { Plus, Save, X, Download, Upload, RefreshCw } from 'lucide-react';
```

## Variantes Disponibles

| Variante | Color | Uso recomendado | Ejemplo |
|----------|-------|-----------------|---------|
| `create` | 🟢 Verde | Crear nuevos registros | Nuevo Activo, Nuevo Empleado |
| `export` | 🟢 Verde | Exportar datos | Exportar a Excel |
| `import` | 🟠 Naranja | Importar datos | Importar desde Excel |
| `template` | 🟣 Púrpura | Descargar plantillas | Descargar Plantilla |
| `refresh` | 🔵 Azul | Refrescar datos | Actualizar página |
| `save` | 🔵 Azul | Guardar cambios | Guardar, Actualizar |
| `cancel` | ⚪ Gris | Cancelar acción | Cancelar, Cerrar |
| `delete` | 🔴 Rojo | Eliminar registros | Eliminar, Borrar |
| `edit` | 🟡 Amarillo | Editar registros | Editar |
| `primary` | 🔵 Azul primario | Acción principal destacada | Acción principal |

## Props

```typescript
interface ActionButtonProps {
  variant: ActionButtonVariant;  // Tipo de botón (obligatorio)
  icon?: LucideIcon;              // Icono opcional de lucide-react
  loading?: boolean;              // Estado de carga
  loadingText?: string;           // Texto durante la carga
  children: React.ReactNode;      // Texto del botón
  // ... todas las props estándar de HTMLButtonElement
}
```

## Ejemplos de Uso

### Botón básico
```tsx
<ActionButton
  variant="create"
  icon={Plus}
  onClick={() => setIsModalOpen(true)}
>
  Nuevo Activo
</ActionButton>
```

### Botón con estado de carga
```tsx
<ActionButton
  type="submit"
  variant="save"
  icon={Save}
  loading={mutation.isPending}
  loadingText="Guardando..."
>
  Guardar
</ActionButton>
```

### Botón de acción simple
```tsx
<ActionButton
  variant="refresh"
  icon={RefreshCw}
  onClick={handleRefresh}
  title="Refrescar página"
>
  Refrescar
</ActionButton>
```

### Botón de cancelar
```tsx
<ActionButton
  type="button"
  variant="cancel"
  icon={X}
  onClick={onCancel}
>
  Cancelar
</ActionButton>
```

### Botón para export/import
```tsx
<ActionButton
  variant="export"
  icon={Download}
  onClick={handleExport}
  title="Exportar a Excel"
>
  Exportar
</ActionButton>

<ActionButton
  variant="import"
  icon={Upload}
  onClick={handleImport}
  title="Importar desde Excel"
>
  Importar
</ActionButton>
```

### Botón de plantilla
```tsx
<ActionButton
  variant="template"
  icon={FileText}
  onClick={handleDownloadTemplate}
  title="Descargar plantilla Excel"
>
  Plantilla
</ActionButton>
```

### Botón de editar
```tsx
<ActionButton
  variant="edit"
  icon={Edit2}
  onClick={handleEdit}
>
  Editar
</ActionButton>
```

## Características

- ✅ **Estilos consistentes**: Todos los botones siguen el mismo patrón visual
- ✅ **Modo oscuro**: Soporte completo para tema oscuro
- ✅ **Estados**: Hover, disabled, loading automáticos
- ✅ **Iconos**: Integración fácil con lucide-react
- ✅ **Accesibilidad**: Soporta todos los atributos HTML estándar (title, disabled, etc.)
- ✅ **TypeScript**: Completamente tipado

## Migración desde botones antiguos

### Antes
```tsx
<button
  onClick={handleRefresh}
  className="btn btn-secondary flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
>
  <RefreshCw className="h-5 w-5" />
  Refrescar
</button>
```

### Después
```tsx
<ActionButton
  variant="refresh"
  icon={RefreshCw}
  onClick={handleRefresh}
>
  Refrescar
</ActionButton>
```

## Notas

- El icono se renderiza automáticamente con tamaño `h-5 w-5`
- El componente usa `forwardRef` para permitir refs
- Todas las clases CSS se aplican automáticamente según la variante
- El estado `loading` deshabilita automáticamente el botón
