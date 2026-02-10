### Ejemplo de otras entidades clave

#### Employee Entity
```typescript
@Entity('employees')
export class Employee {
	@PrimaryGeneratedColumn({ name: 'id' }) id: number;
	@Column({ name: 'first_name' }) firstName: string;
	@Column({ name: 'last_name' }) lastName: string;
	@Column({ name: 'email' }) email: string;
	@Column({ name: 'is_active', default: true }) isActive: boolean;
	@OneToMany(() => Assignment, (a) => a.employee)
	assignments: Assignment[];
}
```

#### Assignment Entity
```typescript
@Entity('asset_assignments')
export class Assignment {
	@PrimaryGeneratedColumn({ name: 'id' }) id: number;
	@Column({ name: 'asset_id' }) assetId: number;
	@Column({ name: 'employee_id' }) employeeId: number;
	@Column({ name: 'assigned_at', type: 'date' }) assignedAt: Date;
	@Column({ name: 'returned_at', type: 'date', nullable: true }) returnedAt?: Date;
	@ManyToOne(() => Employee, (e) => e.assignments)
	employee: Employee;
	@ManyToOne(() => Asset)
	asset: Asset;
}
```

#### User Entity
```typescript
@Entity('app_users')
export class User {
	@PrimaryGeneratedColumn({ name: 'id' }) id: number;
	@Column({ name: 'email' }) email: string;
	@Column({ name: 'password_hash' }) passwordHash: string;
	@Column({ name: 'created_at', type: 'timestamp' }) createdAt: Date;
	// ...relaciones con roles
}
```

---
### Ejemplo de DTOs de actualización y respuesta

#### UpdateAssetDto
```typescript
export class UpdateAssetDto {
	assetTag?: string;
	typeId?: number;
	statusId?: number;
	modelId?: number;
	employeeId?: number;
	purchaseDate?: string;
}
```

#### AssetResponseDto
```typescript
export class AssetResponseDto {
	id: number;
	assetTag: string;
	type: string;
	status: string;
	employee?: { id: number; name: string };
	// ...otros campos
}
```

---
### Ejemplo de relaciones entre entidades

```typescript
// En Asset
@ManyToOne(() => Employee, (e) => e.assets, { nullable: true })
employee?: Employee;

// En Employee
@OneToMany(() => Asset, (a) => a.employee)
assets: Asset[];
```

---
### Ejemplo de validaciones con class-validator

```typescript
import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsString()
	email: string;

	@IsOptional()
	@IsDateString()
	joinedAt?: string;
}
```

---
### Ejemplo de uso de guards y decoradores de permisos

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'it')
@Post()
createAsset(@Body() dto: CreateAssetDto) { ... }
```

---
### Ejemplo de test unitario básico (backend)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service';

describe('AssetsService', () => {
	let service: AssetsService;
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AssetsService],
		}).compile();
		service = module.get<AssetsService>(AssetsService);
	});
	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
```

---
### Ejemplo de componente de formulario en frontend

```tsx
import { useForm } from 'react-hook-form';

export default function CreateEmployeeForm({ onSuccess }) {
	const { register, handleSubmit, formState: { errors } } = useForm();
	const onSubmit = data => { /* llamada a API */ onSuccess(); };
	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<input {...register('firstName', { required: true })} />
			{errors.firstName && <span>Requerido</span>}
			<input {...register('lastName', { required: true })} />
			<button type="submit">Crear</button>
		</form>
	);
}
```

---
### Notas sobre paginación, filtros y ordenación

- Los endpoints de listado aceptan parámetros `page`, `limit`, `sort`, `filter`.
- Ejemplo: `/api/assets?page=1&limit=20&sort=createdAt:desc&filter=status:assigned`
- El backend responde con `{ data: [...], total: 100, page: 1, limit: 20 }`

---
> Nota: Los nombres de columnas en la base de datos usan snake_case (ej: asset_tag), mientras que en el código (entidades, DTOs) se usa camelCase (ej: assetTag).
---
### Ejemplo de entidades y DTOs (backend)

#### Asset Entity (TypeORM)
```typescript
@Entity('assets')
export class Asset {
	@PrimaryGeneratedColumn({ name: 'id' }) id: number;
	@Column({ name: 'asset_tag' }) assetTag: string;
	@Column({ name: 'serial' }) serial: string;
	@Column({ name: 'type_id' }) typeId: number;
	@Column({ name: 'status_id' }) statusId: number;
	@Column({ name: 'model_id', nullable: true }) modelId?: number;
	@Column({ name: 'employee_id', nullable: true }) employeeId?: number;
	@Column({ name: 'purchase_date', type: 'date', nullable: true }) purchaseDate?: Date;
	// ...otros campos relevantes
}
```

#### CreateAssetDto
```typescript
export class CreateAssetDto {
	assetTag: string;
	typeId: number;
	statusId: number;
	modelId?: number;
	employeeId?: number;
	purchaseDate?: string;
	// ...otros campos
}
```

---
### Ejemplo de endpoint REST (backend)

**Crear activo:**
```
POST /api/assets
Body:
{
	"assetTag": "PC-001",
	"typeId": 1,
	"statusId": 1,
	"modelId": 2,
	"employeeId": 5
}
Response:
{
	"message": "Activo creado exitosamente",
	"data": { ...Asset }
}
```

**Asignar activo:**
```
POST /api/assignments
Body:
{
	"assetId": 1,
	"employeeId": 5,
	"assignedAt": "2024-01-01"
}
```

---
### Convenciones de nombres y estructura

- Archivos y carpetas en kebab-case (ej: assets.controller.ts, create-asset.dto.ts)
- Clases y entidades en PascalCase (ej: Asset, CreateAssetDto)
- Variables y métodos en camelCase
- Endpoints RESTful, pluralizados (ej: /api/assets, /api/employees)

---
### Flujo de autenticación y autorización

1. El usuario inicia sesión vía `/api/auth/login` y recibe un JWT.
2. El JWT se almacena en localStorage (frontend) y se envía en el header Authorization en cada request.
3. El backend valida el JWT y los permisos del usuario según su rol.
4. Los endpoints protegidos usan el guard `JwtAuthGuard` y decoradores de roles/permisos.

---
### Manejo de estado y llamadas a API (frontend)

- Estado global de autenticación con Zustand (`authStore`)
- Datos remotos (activos, empleados, etc.) con React Query (`useQuery`, `useMutation`)
- Llamadas a API centralizadas en `/src/services/`
- Formularios con `react-hook-form`
- Notificaciones con `react-hot-toast` o `react-toastify`

**Ejemplo de llamada a API:**
```typescript
// assetsService.ts
export const assetsService = {
	create: async (data) => {
		const response = await api.post('/assets', data);
		return response.data;
	},
};
```

---
### Manejo de errores y validaciones

- Backend: Validación con DTOs y pipes de NestJS, respuestas con mensajes claros y status HTTP.
- Frontend: Validación de formularios, manejo de errores de API con feedback visual.

**Ejemplo de error:**
```
{
	"statusCode": 400,
	"message": "El campo assetTag es obligatorio"
}
```

---
### Importación y exportación de datos

- Importar activos desde Excel: `/api/assets/import-excel` (array de objetos)
- Exportar inventario: `/api/assets/export` (Excel, CSV, PDF)
- Frontend usa utilidades para parsear y generar archivos Excel/CSV

---
### Notas adicionales

- Fechas en formato ISO (YYYY-MM-DD)
- Internacionalización: Español por defecto
- Los IDs son numéricos (autoincrement o PK de base de datos)
- Los endpoints devuelven siempre un objeto con `message` y `data`

---
### Tecnologías y buenas prácticas

#### Backend
- **Framework:** NestJS (Node.js, TypeScript)
- **Base de datos:** PostgreSQL (TypeORM)
- **Autenticación:** JWT, RBAC (roles y permisos)
- **Estructura:** Modular, controladores, servicios, DTOs, entidades
- **Prácticas:**
	- Usa decoradores de NestJS para rutas, validación y seguridad
	- DTOs para validación de datos de entrada
	- Servicios para lógica de negocio
	- Repositorios TypeORM para acceso a datos
	- Control de errores con excepciones de NestJS
	- Código tipado y modular

#### Frontend
- **Framework:** React (TypeScript, Vite)
- **UI:** TailwindCSS, react-hot-toast, react-query
- **Gestión de estado:** Zustand (authStore), react-query
- **Prácticas:**
	- Componentes funcionales y hooks
	- Manejo de formularios con react-hook-form
	- Llamadas a API mediante servicios centralizados
	- Manejo de rutas con react-router-dom
	- Validación y feedback al usuario con notificaciones
	- Código tipado y reutilizable

## SKILL: IT-Inventory-POT

### Descripción General
IT-Inventory-POT es un sistema completo para la gestión de inventario de activos tecnológicos, asignaciones a empleados, catálogos, roles y permisos, con autenticación JWT y control de acceso basado en roles (RBAC). Incluye backend (NestJS, PostgreSQL), frontend (React, Vite, Tailwind), y documentación técnica y de usuario.

### Entidades y Módulos Principales
- **Activos (Assets):** Registro, edición, baja, importación/exportación, asignación y seguimiento de activos IT (PC, laptops, móviles, tablets, etc.).
- **Empleados (Employees):** Gestión de empleados, consulta, alta/baja, historial de asignaciones.
- **Asignaciones (Assignments):** Asignar y devolver activos a empleados, historial de movimientos.
- **Catálogos (Catalogs):** Tipos, modelos, marcas, estados, secciones, sistemas operativos.
- **Usuarios y Roles:** Autenticación, gestión de usuarios, roles (Admin, IT, Viewer) y permisos granulares.

### Endpoints REST principales
- `/api/auth/login` - Login de usuario
- `/api/auth/register` - Registro de usuario
- `/api/auth/profile` - Perfil autenticado
- `/api/assets` - CRUD de activos
- `/api/employees` - CRUD de empleados
- `/api/assignments` - Asignar/devolver activos
- `/api/catalogs/*` - Consultar y modificar catálogos

### Flujos y funcionalidades clave
- Importar activos desde Excel y gestionar duplicados
- Exportar inventario a Excel, CSV, PDF
- Asignar activos a empleados y registrar devoluciones
- Consultar historial de asignaciones por activo o empleado
- Alertas de garantías próximas a vencer
- Búsqueda global de activos, empleados y asignaciones
- Control de acceso por roles y permisos (RBAC)
- Notificaciones de eventos importantes

### Roles y permisos
- **Admin:** Acceso total, gestión de usuarios, roles y configuración
- **IT:** Gestión de activos, asignaciones y catálogos
- **Viewer:** Solo lectura

Permisos granulares: `assets.read`, `assets.create`, `assets.update`, `assets.retire`, `assignments.manage`, `catalogs.manage`, `users.manage`

### Estructura de carpetas relevante
- `backend/src/assets/`, `employees/`, `assignments/`, `catalogs/`, `auth/`, `entities/`
- `frontend/src/pages/AssetsPage.tsx`, `EmployeesPage.tsx`, `components/`, `services/`
- Documentación en `documentation/docs/`

### Ejemplos de tareas que puede realizar el agente
- "Agrega un nuevo activo de tipo 'PC Portátil' para el sitio X."
- "Lista los empleados con activos asignados."
- "Exporta el inventario de activos a Excel."
- "Crea un nuevo modelo de impresora en el catálogo."
- "Muestra el historial de asignaciones de un empleado."

### Notas
- El backend corre en el puerto 3000, frontend en 5173.
- El frontend hace proxy de `/api` al backend.
- JWT expira en 7 días, contraseñas hasheadas con bcrypt.
- Consultar documentación en `documentation/` para detalles avanzados.
