# IT Inventory - AI Coding Agent Instructions

## ⚠️ CRITICAL: Error Checking Protocol

**BEFORE marking any task as complete, you MUST:**
1. Run `get_errors` tool on all modified files
2. Review and fix ALL TypeScript/compilation errors
3. Verify imports are correct and unused variables are removed
4. Test that the code compiles without errors
5. **NEVER say "está listo" or "ya está" until errors are ZERO**

This is NON-NEGOTIABLE. Delivering code with compilation errors is unacceptable.

---

## 🏗️ Architecture Overview

**Monorepo Structure**: Three main workspaces with independent `package.json`:
- `backend/` - NestJS + TypeScript + TypeORM + PostgreSQL
- `frontend/` - React + TypeScript + Vite + TailwindCSS + Zustand + React Query
- `documentation/website/` - Docusaurus (deployed to GitHub Pages)

**Backend Pattern**: NestJS modular architecture with TypeORM repositories
- **Module Structure**: Each module is COMPLETELY INDEPENDENT with its own folder:
  ```
  backend/src/[module-name]/
  ├── [module-name].controller.ts  # API endpoints
  ├── [module-name].service.ts     # Business logic
  ├── [module-name].module.ts      # Module registration
  └── dto/
      └── [module-name].dto.ts     # Data validation
  ```
- **Critical Rule**: NEVER mix multiple resources in one module (e.g., don't put families and versions in same folder)
- **Example**: `asset-os-versions/` and `asset-os-families/` are SEPARATE modules, not nested
- Entities define database schema with TypeORM decorators (`@Entity`, `@Column`, `@ManyToOne`)
- Auth: JWT via `JwtAuthGuard`, RBAC with roles (admin, it, viewer) and granular permissions
- Global validation pipe with `class-validator` decorators (`@IsNotEmpty`, `@IsEmail`, etc.)

**Frontend Pattern**: Service-layer architecture with centralized state
- API services in `src/services/` export objects with methods (e.g., `OsService.getAll()`)
- Auth state managed with Zustand + persist middleware (token in cookies via `src/utils/cookies.ts`)
- React Query for server state caching (query keys follow pattern: `['entity', siteId, filters]`)
- Inactivity logout hook: 1-hour timeout via `useInactivityLogout`

## 🔑 Critical Patterns & Conventions

### Backend Development
- **DTOs**: Always use `class-validator` decorators for input validation
- **Services**: Inject TypeORM repositories via constructor: `Repository<Entity>`
- **Controllers**: Use NestJS decorators (`@UseGuards(JwtAuthGuard)`, `@ApiTags()`, `@ApiBearerAuth()`)
- **Relations**: Eager load with `relations: ['nestedEntity']` in `find()` queries
- **Auditoría (OBLIGATORIO)**: SIEMPRE incluir `relations: ['creator', 'updater']` en queries de `findAll()` y `findOne()` para mostrar información de auditoría en el frontend
- **Error Handling (OBLIGATORIO)**: SIEMPRE envolver `repository.save()` en try-catch para capturar violaciones de constraints UNIQUE:
  ```typescript
  try {
    const saved = await this.repository.save(entity);
    return saved;
  } catch (error: any) {
    if (error.code === '23505') { // PostgreSQL UNIQUE constraint violation
      const constraintName = error.constraint;
      if (constraintName?.includes('ux_specific_constraint')) {
        throw new ConflictException('Mensaje descriptivo en español');
      }
      throw new ConflictException('Mensaje genérico de respaldo');
    }
    throw error;
  }
  ```
- **Global prefix**: All API routes prefixed with `/api` (configured in `main.ts`)
- **Swagger**: Auto-documented at `http://localhost:3000/api-docs`

### Frontend Development
- **Components**: Use TypeScript with explicit prop interfaces
- **Forms**: Prefer controlled components with state, NOT react-hook-form in most pages
- **Styling**: TailwindCSS with dark mode support (`dark:` variants)
- **Buttons**: Use `ActionButton` component with predefined variants (create, export, import, refresh, etc.)
  ```tsx
  <ActionButton variant="create" icon={Plus} onClick={handler}>
    Nuevo
  </ActionButton>
  ```
- **Tables**: Use `DataTable` component with `Column<T>[]` config (supports sorting, filtering, pagination)
- **Modals**: Use `Modal` component with `isOpen`, `onClose`, `title`, `size`, `headerActions` props
- **Color Helpers**: Use `getSiteColor()`, `getOSFamilyColor()` from `src/utils/uiHelpers.ts` for consistent badges
- **Services**: Follow naming pattern: lowercase for entities (e.g., `authService`), PascalCase for special cases (e.g., `OsService`)
- **API calls**: Use `axios` instance from `src/services/api.ts` (auto-attaches Bearer token)

#### **UI Page Structure (OBLIGATORIO)**
- **TODAS las páginas DEBEN seguir el patrón de `AssetsPage.tsx`**:
  1. **Header**: Título (h1) + botones de acción alineados a la derecha (Refrescar, Exportar, Plantilla, Importar, Crear)
  2. **Filtros**: Usar `DataTableFilters` component con `FilterConfig[]` cuando aplique
  3. **Tabla**: Envuelta en `<div className="card">` con loading state y `DataTable` component
  4. **Modales**: Modal de crear + Modal de detalles con header actions
- **Estructura HTML exacta**:
  ```tsx
  <div>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Título</h1>
      <div className="flex items-center gap-3">
        {/* Botones de acción */}
      </div>
    </div>
    
    <DataTableFilters filters={filterConfigs} onFilterChange={handleFilterChange} />
    
    <div className="card">
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      ) : (
        <DataTable data={data} columns={columns} keyExtractor={...} />
      )}
    </div>
  </div>
  ```
- **NO crear páginas con estructura diferente a este patrón**

### Multi-Site Architecture
- Backend: Filter queries by `siteId` from JWT payload
- Frontend: Store selected site in `authStore.selectedSiteId`, pass to query keys
- Users can have different roles per site via `user_site_roles` table

### Import/Export Features
- Backend endpoints: `GET /export/excel` (returns blob), `POST /import/excel` (accepts FormData)
- Frontend: Use `Blob` download pattern with `window.URL.createObjectURL()`
- Template generation: Scripts in `scripts/templates/` generate Excel templates using `xlsx` library
- Import results format: `{ success: boolean, message: string, data: { created, updated, errors[] } }`

## 🚀 Essential Commands

**Root-level** (from `/IT-Inventory-POT/`):
```bash
npm run docs:start    # Start Docusaurus dev server (port 3000)
npm run docs:build    # Build static docs site
```

**Backend** (from `backend/`):
```bash
npm run start:dev     # NestJS watch mode (port 3000)
npm run build         # Compile TypeScript to dist/
npm run start:prod    # Run production build
```

**Frontend** (from `frontend/`):
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # TypeScript check + production build
npm run preview      # Preview production build
```

**Database**:
- Initial setup: Run SQL scripts in `scripts/` directory in order:
  1. `create-DB.psql` - Creates schema and tables
  2. `insert-DB.sql` - Seeds initial data (roles, permissions, statuses)
  3. `crear_usuario_admin.sql` - Creates admin user
- Password hashing: `node scripts/generate-password-hash.js <password>`
- Recreate DB: See `RECREAR_DB.md` for full reset instructions

## 📋 Development Workflows

### Adding a New Catalog Entity (Complete Checklist)

**Backend Steps**:
1. **Create Entity** (if not exists): `backend/src/entities/[entity].entity.ts`
   - Use TypeORM decorators: `@Entity()`, `@Column()`, `@ManyToOne()`, etc.
   - Always include: `createdBy`, `updatedBy`, `createdAt`, `updatedAt` columns
   - Add relations: `@ManyToOne(() => User) creator` and `@ManyToOne(() => User) updater`

2. **Create Independent Module Folder**: `backend/src/[entity-name]/`
   ```
   backend/src/[entity-name]/
   ├── [entity-name].controller.ts
   ├── [entity-name].service.ts
   ├── [entity-name].module.ts
   └── dto/
       └── [entity-name].dto.ts
   ```

3. **Create DTOs**: `dto/[entity-name].dto.ts`
   - `CreateEntityDto` with `@IsNotEmpty()`, `@IsBoolean()`, etc.
   - `UpdateEntityDto` with `@IsOptional()` for all fields

4. **Create Service**: `[entity-name].service.ts`
   - Inject repository: `@InjectRepository(Entity) private repository: Repository<Entity>`
   - Methods: `getAll()`, `getById(id)`, `create(dto, userId)`, `update(id, dto, userId)`
   - Excel methods: `exportToExcel()`, `generateTemplate()`, `importFromExcel()`, `updateDuplicatesFromExcel()`
   - Always pass `userId` to create/update methods and set `createdBy`/`updatedBy`

5. **Create Controller**: `[entity-name].controller.ts`
   - Use `@Controller('[entity-name]')` decorator
   - Routes order: specific routes BEFORE dynamic `:id` routes
   - Standard endpoints:
     - `GET /` - List all
     - `POST /` - Create new
     - `GET /export/excel` - Export to Excel
     - `GET /template/excel` - Download template
     - `POST /import/excel` - Import from Excel
     - `POST /update-duplicates-excel` - Update duplicates
     - `GET /:id` - Get by ID (MUST be after specific routes)
     - `PUT /:id` - Update by ID

6. **Create Module**: `[entity-name].module.ts`
   - Import TypeORM entity: `TypeOrmModule.forFeature([Entity])`
   - Export service if needed by other modules

7. **Register Module**: Add to `app.module.ts` imports array

**Frontend Steps**:
1. **Create Service**: `frontend/src/services/[entity]Service.ts`
   - Export object with methods (not class)
   - Use `api` instance from `src/services/api.ts`
   - Methods: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `exportToExcel()`, `downloadTemplate()`, `importFromExcel(file)`, `updateDuplicatesFromExcel(duplicates)`

2. **Create Form Component**: `frontend/src/components/forms/catalogs/[Entity]Form.tsx`
   - **MUST follow exact pattern from `AssetModelForm.tsx`**
   - Use react-hook-form: `useForm<FormData>()`
   - Props: `mode`, `entityId?`, `onSuccess`, `onCancel`, `onHeaderButtons?`
   - State: `isEditing`, `isSubmitting`
   - Use `useQuery` to fetch data in edit mode
   - Disable inputs when `!isEditing` in edit mode
   - Header buttons: Edit/Save/Cancel via `onHeaderButtons` callback

3. **Create Page Component**: `frontend/src/pages/catalogs/[Entity]Page.tsx`
   - **MUST follow exact pattern from `AssetModelsPage.tsx`**
   - State: `data`, `loading`, `showCreateModal`, `showDetailsModal`, `selectedEntityId`, `modalHeaderButtons`
   - Handlers: `handleEntityClick`, `handleCreateSuccess`, `handleUpdateSuccess`, `handleDetailsModalClose`, `handleDetailsHeaderButtons`
   - Two modals: Create (mode="create") and Details (mode="edit", with headerActions)
   - Column for name MUST be clickable button that opens Details modal
   - Include export/import functionality

4. **Add Route**: Register in `App.tsx` or router configuration

**RBAC Permission Check**:
- Backend: Use `@RequirePermission('permission:action')` decorator (custom implementation)
- Frontend: Check `useAuthStore().hasPermission('permission:action')`
- Common permissions: `assets:read`, `assets:create`, `employees:manage`, etc.

**Excel Import/Export**:
- Backend: Use `xlsx` library methods `read()`, `write()`, `utils.sheet_to_json()`
- Frontend: Accept `.xlsx,.xls` file types, use `FormData` for upload
- Template scripts: Located in `scripts/templates/`, run with `node create-[entity]-template.js`

## 🎨 UI/UX Conventions

- **Page Headers**: Title (h1) + action buttons right-aligned
- **Loading States**: Show `"Cargando..."` with appropriate entity name
- **Empty States**: Custom messages via `emptyMessage` prop on DataTable
- **Toasts**: Use `react-hot-toast` for success/error feedback (already imported in App.tsx)
- **Modal Sizes**: `xxl` for forms with complex fields, `lg` for simple confirmations
- **Dark Mode**: Always provide `dark:` variants for colors, borders, backgrounds

## 🔒 Security Notes

- JWT secret: Configured in `backend/.env` as `JWT_SECRET`
- Token expiry: Default 7 days (`JWT_EXPIRES_IN=7d`)
- Password hashing: bcryptjs with 10 salt rounds
- Auth guard: `JwtAuthGuard` validates tokens on protected routes
- Frontend auto-logout: 1-hour inactivity timer

## 📚 Documentation

- User guides: `documentation/docs/user/`
- Technical docs: `documentation/docs/it/`
- API reference: Auto-generated Swagger at `/api-docs`
- Architecture: See `backend/ARQUITECTURA.md` for detailed backend patterns
- Quick start: `INICIO_RAPIDO.md` for setup steps
- Commands reference: `Commands.md` for macOS terminal commands

## ⚠️ Common Pitfalls & Critical Rules

### Backend
- **Module Independence**: NEVER mix multiple resources in one module/folder. Each resource needs its own complete folder structure.
- **Route Ordering**: Specific routes (`/export/excel`, `/template/excel`) MUST come BEFORE dynamic routes (`/:id`) in controllers
- **User Tracking**: ALWAYS pass `userId` from JWT to service methods and set `createdBy`/`updatedBy`
- **TypeORM Sync**: Uses `synchronize: false` in production (migrations required)

### Frontend
- **Pattern Adherence**: When creating new pages/forms, ALWAYS reference and copy the exact pattern from:
  - Pages: `AssetModelsPage.tsx`, `AssetBrandsPage.tsx`, `AssetOSFamiliesPage.tsx`
  - Forms: `AssetModelForm.tsx`, `AssetBrandForm.tsx`, `AssetOSFamiliesForm.tsx`
- **Modal Pattern**: Two modals per page (Create + Details), NOT one modal with multiple modes
- **Form Pattern**: Use react-hook-form, NOT controlled state (except in AssetForm.tsx for special cases)
- **Click Behavior**: Name column opens Details modal (view mode), NOT edit modal
- **Header Buttons**: Only Details modal has header actions (Edit/Save/Cancel), Create modal has inline buttons
- **State Reset**: ALWAYS reset `modalHeaderButtons` to `null` when opening/closing modals
- **Query Invalidation**: Always invalidate React Query cache after mutations: `queryClient.invalidateQueries({ queryKey: ['entity'] })`
- **API base URL**: Hardcoded to `http://localhost:3000/api` in `src/services/api.ts`
- **File Uploads**: Remember to reset `input.value = ''` after processing to allow re-uploads

### Frontend - Columnas de Tablas (OBLIGATORIO)
- **Columnas Requeridas**: Todas las páginas de catálogos DEBEN incluir estas columnas en DataTable:
  1. ID
  2. Columnas específicas de la entidad (nombre, código, etc.)
  3. **Estado** (badge Activo/Inactivo)
  4. **Creado por** (`creator?.userName || '-'`)
  5. **Creación** (fecha formateada con `toLocaleString('es-ES')`)
- **Ejemplo de columnas obligatorias**:
  ```typescript
  {
    key: 'createdBy',
    label: 'Creado por',
    width: '12%',
    sortable: true,
    render: (item) => (item.creator?.userName || '-'),
  },
  {
    key: 'createdAt',
    label: 'Creación',
    sortable: true,
    render: (item) => (item.createdAt ? new Date(item.createdAt).toLocaleString('es-ES') : '-'),
  }
  ```
- **Interfaces de servicio**: SIEMPRE incluir `creator?: { userName: string }; updater?: { userName: string };` en las interfaces

### Frontend - Formularios de Catálogos (OBLIGATORIO)
- **Checkbox Toggle Style**: El checkbox de "Activo" DEBE usar el componente toggle (NO checkbox simple):
  ```tsx
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
  ```
- **Sección Información del Sistema**: SIEMPRE incluir al final del formulario en modo edit:
  ```tsx
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
  ```
- **Botones en modo Create**: DEBEN incluir iconos y border-top:
  ```tsx
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
        Crear [Entidad]
      </ActionButton>
    </div>
  )}
  ```

### Excel Import/Export
- **Template Format**: First sheet has data, optional second sheet has reference data
- **Duplicate Handling**: Return duplicates array for user confirmation, then call `update-duplicates-excel` endpoint
- **Error Handling**: Always return `{ insertados, duplicados, errores }` from import methods

## 📚 Documentation References

- **Architecture**: `backend/ARQUITECTURA.md` - Backend patterns and conventions
- **Concurrency Control**: `CONTROL_CONCURRENCIA.md` - Strategy for handling concurrent operations and race conditions
- **Error Handling**: `MANEJO_ERRORES_CONSTRAINTS.md` - Comprehensive guide for UNIQUE constraint violations (MUST READ before creating services)
- **Quick Start**: `INICIO_RAPIDO.md` - Setup and installation instructions
- **Commands**: `Commands.md` - macOS terminal commands reference
