# Patrones de UI y Componentes Frontend

## 📋 Descripción General

Esta guía documenta los patrones estándar de UI y componentes reutilizables del frontend de IT Inventory. Seguir estos patrones garantiza consistencia visual y funcional en toda la aplicación.

## 🎯 Estructura de Página Estándar

### Patrón OBLIGATORIO para Páginas de Catálogos

**TODAS las páginas de catálogos DEBEN seguir este patrón**:

```tsx
<div>
  {/* 1. HEADER: Título + Botones de Acción */}
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      Tipos de Activos
    </h1>
    <div className="flex items-center gap-3">
      <ActionButton variant="refresh" icon={RefreshCw} onClick={refetch} />
      <ActionButton variant="export" icon={Download} onClick={handleExport} />
      <ActionButton variant="import" icon={Upload} onClick={handleImport} />
      <ActionButton variant="create" icon={Plus} onClick={() => setShowCreateModal(true)} />
    </div>
  </div>
  
  {/* 2. FILTROS (Opcional) */}
  <DataTableFilters 
    filters={filterConfigs} 
    onFilterChange={handleFilterChange} 
  />
  
  {/* 3. TABLA DE DATOS */}
  <div className="card">
    {isLoading ? (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    ) : (
      <DataTable 
        data={assetTypes} 
        columns={columns} 
        keyExtractor={(item) => item.id.toString()}
      />
    )}
  </div>
  
  {/* 4. MODALES */}
  <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Crear Tipo">
    <AssetTypeForm mode="create" onSuccess={handleCreateSuccess} />
  </Modal>
  
  <Modal 
    isOpen={showDetailsModal} 
    onClose={handleDetailsModalClose}
    title="Detalles del Tipo"
    headerActions={modalHeaderButtons}
  >
    <AssetTypeForm 
      mode="edit" 
      entityId={selectedEntityId}
      onSuccess={handleUpdateSuccess}
      onHeaderButtons={handleDetailsHeaderButtons}
    />
  </Modal>
</div>
```

### Referencia: Páginas Modelo

Al crear nuevas páginas, **SIEMPRE copiar el patrón de**:
- ✅ `AssetModelsPage.tsx`
- ✅ `AssetBrandsPage.tsx`
- ✅ `AssetOSFamiliesPage.tsx`

**NO inventar estructura diferente**.

---

## 🧩 Componentes Reutilizables

### ActionButton

Botón con variantes predefinidas y consistentes.

**Props**:
```typescript
interface ActionButtonProps {
  variant: 'create' | 'save' | 'cancel' | 'edit' | 'export' | 'import' | 'refresh' | 'template';
  icon?: LucideIcon;
  onClick?: () => void;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}
```

**Uso**:
```tsx
// Botón de crear (azul)
<ActionButton variant="create" icon={Plus} onClick={handleCreate}>
  Nuevo Tipo
</ActionButton>

// Botón de guardar (verde)
<ActionButton 
  variant="save" 
  icon={Save} 
  type="submit"
  loading={isSubmitting}
  loadingText="Guardando..."
>
  Guardar Cambios
</ActionButton>

// Botón de cancelar (gris)
<ActionButton variant="cancel" icon={X} onClick={onCancel}>
  Cancelar
</ActionButton>

// Botón de editar (naranja)
<ActionButton variant="edit" icon={Edit2} onClick={handleEdit}>
  Editar
</ActionButton>

// Botón de exportar (verde)
<ActionButton variant="export" icon={Download} onClick={handleExport}>
  Exportar
</ActionButton>

// Botón de importar (índigo)
<ActionButton variant="import" icon={Upload} onClick={handleImport}>
  Importar
</ActionButton>

// Botón de refrescar (gris)
<ActionButton variant="refresh" icon={RefreshCw} onClick={refetch}>
  Refrescar
</ActionButton>
```

**Variantes y colores**:
| Variant | Color | Uso típico |
|---------|-------|-----------|
| create | Azul | Crear nuevo registro |
| save | Verde | Guardar cambios |
| cancel | Gris | Cancelar operación |
| edit | Naranja | Editar registro |
| export | Verde | Exportar a Excel |
| import | Índigo | Importar desde Excel |
| refresh | Gris | Recargar datos |
| template | Teal | Descargar plantilla |

---

### DataTable

Tabla con sorting, filtrado y renderizado personalizable.

**Props**:
```typescript
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}
```

**Uso**:
```tsx
const columns: Column<AssetType>[] = [
  { 
    key: 'id', 
    label: 'ID', 
    sortable: true, 
    width: '10%' 
  },
  { 
    key: 'name', 
    label: 'Nombre', 
    sortable: true,
    render: (item) => (
      <button 
        onClick={() => handleRowClick(item.id)}
        className="text-blue-600 hover:underline"
      >
        {item.name}
      </button>
    )
  },
  { 
    key: 'isActive', 
    label: 'Estado',
    render: (item) => (
      <span className={`badge ${item.isActive ? 'success' : 'inactive'}`}>
        {item.isActive ? 'Activo' : 'Inactivo'}
      </span>
    )
  },
  {
    key: 'createdBy',
    label: 'Creado por',
    width: '12%',
    render: (item) => item.creator?.userName || '-'
  },
  {
    key: 'createdAt',
    label: 'Creación',
    sortable: true,
    render: (item) => (
      item.createdAt 
        ? new Date(item.createdAt).toLocaleString('es-ES') 
        : '-'
    )
  }
];

<DataTable
  data={assetTypes}
  columns={columns}
  keyExtractor={(item) => item.id.toString()}
  emptyMessage="No hay tipos de activos registrados"
/>
```

**Columnas Obligatorias en Catálogos**:
1. ✅ ID
2. ✅ Nombre/Código (clickeable para abrir detalles)
3. ✅ Estado (badge Activo/Inactivo)
4. ✅ **Creado por** (`creator?.userName || '-'`)
5. ✅ **Fecha de creación** (formateada con `toLocaleString('es-ES')`)

**Ejemplo de columna clickeable**:
```tsx
{
  key: 'name',
  label: 'Nombre',
  sortable: true,
  render: (item) => (
    <button
      onClick={() => handleRowClick(item.id)}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium"
    >
      {item.name}
    </button>
  )
}
```

---

### Modal

Modal reutilizable con header actions y tamaños configurables.

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}
```

**Uso**:
```tsx
// Modal simple
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Crear Tipo de Activo"
  size="lg"
>
  <AssetTypeForm mode="create" />
</Modal>

// Modal con header actions (solo para modal de detalles)
<Modal
  isOpen={showDetailsModal}
  onClose={handleDetailsModalClose}
  title="Detalles del Tipo"
  size="xl"
  headerActions={
    <>
      {isEditing ? (
        <>
          <ActionButton variant="cancel" icon={X} onClick={() => setIsEditing(false)}>
            Cancelar
          </ActionButton>
          <ActionButton variant="save" icon={Save} onClick={handleSave}>
            Guardar
          </ActionButton>
        </>
      ) : (
        <ActionButton variant="edit" icon={Edit2} onClick={() => setIsEditing(true)}>
          Editar
        </ActionButton>
      )}
    </>
  }
>
  <AssetTypeForm mode="edit" entityId={selectedId} />
</Modal>
```

**Tamaños disponibles**:
| Size | Ancho | Uso |
|------|-------|-----|
| sm | 400px | Confirmaciones simples |
| md | 600px | Formularios básicos |
| lg | 800px | Formularios estándar |
| xl | 1000px | Formularios complejos |
| xxl | 1200px | Formularios muy grandes |

---

### DataTableFilters

Componente de filtros para tablas.

**Props**:
```typescript
interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  options?: { value: string | boolean; label: string }[];
}

interface DataTableFiltersProps {
  filters: FilterConfig[];
  onFilterChange: (key: string, value: any) => void;
}
```

**Uso**:
```tsx
const filterConfigs: FilterConfig[] = [
  {
    key: 'name',
    label: 'Nombre',
    type: 'text'
  },
  {
    key: 'isActive',
    label: 'Estado',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: true, label: 'Activo' },
      { value: false, label: 'Inactivo' }
    ]
  }
];

<DataTableFilters 
  filters={filterConfigs}
  onFilterChange={handleFilterChange}
/>
```

---

## 📝 Patrones de Formularios

### Estructura de Formulario Estándar

**TODOS los formularios de catálogos DEBEN seguir el patrón de `AssetModelForm.tsx`**:

```tsx
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';

interface FormProps {
  mode: 'create' | 'edit';
  entityId?: number;
  onSuccess: () => void;
  onCancel?: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

function AssetTypeForm({ mode, entityId, onSuccess, onCancel, onHeaderButtons }: FormProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  
  // Fetch data en modo edit
  const { data, isLoading } = useQuery({
    queryKey: ['asset-type', entityId],
    queryFn: () => AssetTypeService.getById(entityId!),
    enabled: mode === 'edit' && !!entityId,
    onSuccess: (data) => {
      reset(data.data);
    }
  });
  
  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: AssetTypeService.create,
    onSuccess: () => {
      toast.success('Tipo creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear');
    }
  });
  
  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: (data: FormData) => AssetTypeService.update(entityId!, data),
    onSuccess: () => {
      toast.success('Tipo actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    }
  });
  
  // Header buttons para modal de detalles
  useEffect(() => {
    if (mode === 'edit' && onHeaderButtons) {
      onHeaderButtons(
        isEditing ? (
          <>
            <ActionButton variant="cancel" icon={X} onClick={() => setIsEditing(false)}>
              Cancelar
            </ActionButton>
            <ActionButton variant="save" icon={Save} onClick={handleSubmit(onSubmit)}>
              Guardar
            </ActionButton>
          </>
        ) : (
          <ActionButton variant="edit" icon={Edit2} onClick={() => setIsEditing(true)}>
            Editar
          </ActionButton>
        )
      );
    }
  }, [isEditing, mode, onHeaderButtons]);
  
  const onSubmit = (data: FormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };
  
  if (mode === 'edit' && isLoading) {
    return <div>Cargando...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campos del formulario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre
        </label>
        <input
          type="text"
          {...register('name', { required: 'El nombre es requerido' })}
          disabled={mode === 'edit' && !isEditing}
          className="input"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      
      {/* Checkbox Toggle para isActive (solo en modo edit) */}
      {mode === 'edit' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {data?.data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}
      
      {/* Información del Sistema (solo en modo edit) */}
      {mode === 'edit' && data?.data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.updatedAt ? new Date(data.data.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Botones solo en modo create */}
      {mode === 'create' && (
        <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700">
          <ActionButton
            type="button"
            variant="cancel"
            icon={X}
            onClick={onCancel}
          >
            Cancelar
          </ActionButton>
          <ActionButton
            type="submit"
            variant="save"
            icon={Save}
            loading={createMutation.isPending}
            loadingText="Creando..."
          >
            Crear Tipo
          </ActionButton>
        </div>
      )}
    </form>
  );
}
```

### Reglas Críticas de Formularios

1. ✅ **Modo Create**: Formulario editable, botones inline (Cancelar + Crear)
2. ✅ **Modo Edit**: 
   - Estado inicial: Solo lectura (campos disabled)
   - Header actions: Botón "Editar"
   - Al hacer click en "Editar": Campos habilitados, header actions cambian a "Cancelar + Guardar"
3. ✅ **Checkbox Estado**: Usar toggle (NO checkbox simple), solo en modo edit
4. ✅ **Información del Sistema**: Mostrar creador, modificador y fechas, solo en modo edit
5. ✅ **react-hook-form**: Usar en TODOS los formularios (excepto AssetForm.tsx por razones históricas)

---

## 🎨 Estilos y Clases CSS

### Clases Globales TailwindCSS

```css
/* Tarjeta */
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6;
}

/* Input */
.input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-blue-500 focus:border-transparent
         disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed;
}

/* Select */
.select {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
         focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

/* Badge */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.badge.success {
  @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400;
}

.badge.inactive {
  @apply bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400;
}

.badge.warning {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400;
}

.badge.danger {
  @apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400;
}
```

### Color Helpers

Usar funciones de `src/utils/uiHelpers.ts`:

```typescript
// Colores por site
const siteColor = getSiteColor(siteId);
// Retorna: 'blue' | 'green' | 'purple' | 'orange' | 'pink'

// Colores por familia de SO
const osColor = getOSFamilyColor(familyName);
// Retorna: 'blue' (Windows) | 'gray' (macOS) | 'yellow' (Linux) | 'green' (Android) | 'gray' (iOS)

// Uso en badges
<span className={`badge badge-${siteColor}`}>
  {siteName}
</span>
```

---

## 🔄 Manejo de Estado

### Zustand Store (Estado Global)

Usar para estado de autenticación:

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const user = useAuthStore(state => state.user);
  const hasPermission = useAuthStore(state => state.hasPermission);
  const logout = useAuthStore(state => state.logout);
  
  if (!hasPermission('assets:read')) {
    return <div>No tienes permisos</div>;
  }
  
  return <div>Hola {user?.userName}</div>;
}
```

### React Query (Server State)

Usar para datos del servidor:

```typescript
// Fetch
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['asset-types', siteId],
  queryFn: () => AssetTypeService.getAll(),
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// Mutation
const mutation = useMutation({
  mutationFn: AssetTypeService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['asset-types'] });
    toast.success('Creado exitosamente');
  }
});
```

---

## 🚀 Mejores Prácticas

### DO ✅

1. Usar `ActionButton` con variantes predefinidas
2. Seguir estructura de página estándar
3. Incluir columnas de auditoría en tablas
4. Usar react-hook-form para validación
5. Invalidar queries después de mutations
6. Mostrar toasts para feedback de usuario
7. Implementar estados de loading
8. Usar dark mode (`dark:` variants)

### DON'T ❌

1. Crear botones personalizados sin usar `ActionButton`
2. Inventar estructuras de página diferentes
3. Olvidar columnas de auditoría
4. Usar estado local para formularios complejos
5. Olvidar invalidar queries React Query
6. Operaciones silenciosas sin feedback
7. Olvidar estados de loading
8. Estilos sin soporte dark mode

---

## 📚 Referencias de Componentes

### Archivos Modelo (COPIAR de aquí)

**Páginas**:
- `frontend/src/pages/catalogs/AssetModelsPage.tsx`
- `frontend/src/pages/catalogs/AssetBrandsPage.tsx`
- `frontend/src/pages/catalogs/AssetOSFamiliesPage.tsx`

**Formularios**:
- `frontend/src/components/forms/catalogs/AssetModelForm.tsx`
- `frontend/src/components/forms/catalogs/AssetBrandForm.tsx`
- `frontend/src/components/forms/catalogs/AssetOSFamiliesForm.tsx`

**Componentes**:
- `frontend/src/components/common/ActionButton.tsx`
- `frontend/src/components/common/DataTable.tsx`
- `frontend/src/components/common/Modal.tsx`
- `frontend/src/components/common/DataTableFilters.tsx`

---

**Última actualización**: Enero 2026  
**Mantenedor**: Equipo IT Inventory
