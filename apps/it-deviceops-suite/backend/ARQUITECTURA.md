# IT Inventory Backend - Arquitectura TypeORM

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # [DEPRECADO] Configuración antigua de pg
│   │   └── typeorm.config.ts    # ✅ Configuración de TypeORM DataSource
│   │
│   ├── entities/                # 🗄️ Entidades (modelos de base de datos)
│   │   ├── user.entity.ts
│   │   ├── role.entity.ts
│   │   ├── permission.entity.ts
│   │   ├── role-permission.entity.ts
│   │   ├── user-role.entity.ts
│   │   ├── asset.entity.ts
│   │   ├── asset-type.entity.ts
│   │   ├── asset-brand.entity.ts
│   │   ├── asset-model.entity.ts
│   │   ├── section.entity.ts
│   │   ├── os-family.entity.ts
│   │   ├── os-version.entity.ts
│   │   ├── employee.entity.ts
│   │   └── asset-assignment.entity.ts
│   │
│   ├── auth/                    # 🔐 Módulo de Autenticación
│   │   ├── auth.controller.ts   # Controlador HTTP
│   │   ├── auth.service.ts      # Lógica de negocio
│   │   └── dto/
│   │       └── auth.dto.ts      # DTOs (RegisterUserDto, LoginUserDto)
│   │
│   ├── assets/                  # 📦 Módulo de Activos
│   │   ├── assets.controller.ts
│   │   ├── assets.service.ts
│   │   └── dto/
│   │       └── asset.dto.ts     # CreateAssetDto, UpdateAssetDto, RetireAssetDto
│   │
│   ├── catalogs/                # 📚 Módulo de Catálogos
│   │   ├── catalogs.controller.ts
│   │   ├── catalogs.service.ts
│   │   └── dto/
│   │       └── catalog.dto.ts   # CreateAssetModelDto, CreateAssetBrandDto
│   │
│   ├── employees/               # 👥 Módulo de Empleados
│   │   ├── employees.controller.ts
│   │   ├── employees.service.ts
│   │   └── dto/
│   │       └── employee.dto.ts  # CreateEmployeeDto, UpdateEmployeeDto
│   │
│   ├── assignments/             # 🔄 Módulo de Asignaciones
│   │   ├── assignments.controller.ts
│   │   ├── assignments.service.ts
│   │   └── dto/
│   │       └── assignment.dto.ts # CreateAssignmentDto, ReturnAssignmentDto
│   │
│   ├── routes/                  # 🛣️ Rutas (definición de endpoints)
│   │   ├── auth.ts
│   │   ├── assets.ts
│   │   ├── catalogs.ts
│   │   ├── employees.ts
│   │   └── assignments.ts
│   │
│   ├── middleware/              # 🛡️ Middlewares
│   │   ├── auth.ts              # Verificación JWT
│   │   └── permissions.ts       # Verificación de permisos RBAC
│   │
│   └── index.ts                 # 🚀 Punto de entrada
│
├── package.json
├── tsconfig.json
└── .env
```

## 🏗️ Arquitectura

### Patrón Utilizado: Arquitectura Modular por Funcionalidad

Cada módulo (auth, assets, catalogs, employees, assignments) contiene:
- **Controller**: Maneja peticiones HTTP
- **Service**: Contiene lógica de negocio
- **DTOs**: Validación de datos de entrada (en subcarpeta `dto/`)

Esta estructura modular facilita:
- 📦 **Encapsulación**: Cada módulo es independiente
- 🔍 **Fácil navegación**: Todo relacionado a una funcionalidad está junto
- 🧪 **Testing**: Fácil crear tests por módulo
- 📈 **Escalabilidad**: Agregar nuevos módulos sin afectar existentes

#### 1. **Entidades** (`entities/`)
- Clases decoradas con `@Entity()` que representan tablas de la base de datos
- Usan decoradores de TypeORM: `@Column()`, `@PrimaryGeneratedColumn()`, `@ManyToOne()`, etc.
- Definen relaciones entre tablas

**Ejemplo:**
```typescript
@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'asset_tag', unique: true })
  assetTag: string;

  @ManyToOne(() => AssetType)
  @JoinColumn({ name: 'type_id' })
  type: AssetType;
}
```

#### 2. **DTOs** (`dto/`)
- Data Transfer Objects para validar datos de entrada
- Usan decoradores de `class-validator`: `@IsNotEmpty()`, `@IsEmail()`, etc.
- Separan la estructura de la base de datos de la API

**Ejemplo:**
```typescript
export class CreateAsset[module]/[module].service.ts`)
- Contienen la lógica de negocio
- Interactúan con las entidades a través de `Repository<Entity>`
- Son reutilizables desde múltiples controladores

**Ejemplo:**
```typescript
// assets/assets.service.ts
export class AssetsService {
  private assetRepository: Repository<Asset>;

  constructor() {
    this.assetRepository = AppDataSource.getRepository(Asset);
  }

  async findAll(filters) {
    return await this.assetRepository.find({
      where: filters,
      relations: ['type', 'section', 'model']
    });
  }
}
```

#### 4. **Controladores** (`[module]/[module].controller.ts

  async findAll(filters) {
    return await this.assetRepository.find({
      where: filters,
      relations: ['type', 'section', 'model']
    });
  }
}
```

#### 4. **Controladores** (`controllers/`)
- Manejan las peticiones HTTP
- Validan DTOs
- Llaman a los servicios
- Retornan respuestas HTTP

**Ejemplo:**
// assets/assets.controller.ts
import { AssetsService } from './assets.service';
```typescript
const assetsService = new AssetsService();

export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const result = await assetsService.findAll(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error interno' });
  }
};
```

#### 5. **Rutas** (`routes/`)
- Definen los endpoints de la API
- Aplican middlewares (autenticación, permisos)
- Conectan URLs con controladores
// routes/assets.ts
import { getAssets, createAsset } from '../assets/assets.controller';


**Ejemplo:**
```typescript
router.get('/assets', authMiddleware, checkPermission('assets.read'), getAssets);
router.post('/assets', authMiddleware, checkPermission('assets.create'), createAsset);
```

## 🔧 Tecnologías

- **TypeORM**: ORM para TypeScript
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos
- **Express**: Framework web
- **PostgreSQL**: Base de datos

## 📝 Flujo de una Petición

```
1. Cliente → HTTP Request
2. Express → Middleware (auth, permissions)
3. Router → Encuentra el controlador
4. Controlador → Valida DTO
5. Controlador → Llama al Servicio
6. Servicio → Usa Repository para acceder a la BD
7. TypeORM → Ejecuta queries SQL
8. PostgreSQL → Retorna datos
9. Servicio → Procesa y retorna datos
10. Controlador → Formatea respuesta HTTP
11. Cliente ← HTTP Response
```

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start
```

## 🔐 Autenticación y Autorización

- **JWT** para autenticación
- **RBAC** (Role-Based Access Control) para autorización
- 3 roles: `admin`, `it`, `viewer`
- 7 permisos específicos (assets.read, assets.create, etc.)

## 📊 Base de Datos

- **synchronize: false** - No usamos auto-sync en producción
- Usamos el script SQL `cr + carpetas separadas por tipo):
```
src/
├── controllers/
│   ├── assetsController.ts
│   └── authController.ts
├── services/
│   ├── assetsService.ts
│   └── authService.ts
└── dto/
    ├── asset.dto.ts
    └── auth.dto.ts

// assetsController.ts
export const getAssets = async (req, res) => {
  const result = await pool.query('SELECT * FROM assets WHERE ...');
  res.json(result.rows);
};
```

### Ahora (TypeORM + Módulos por funcionalidad):
```
src/
├── assets/
│   ├── assets.controller.ts
│   ├── assets.service.ts
│   └── dto/
│       └── asset.dto.ts
└── auth/ por módulo
3. **Reutilizable**: Los servicios pueden usarse desde cualquier parte
4. **Testeable**: Fácil de crear tests unitarios y de integración por módulo
5. **Mantenible**: Estructura modular familiar y escalable (similar a NestJS)
6. **Organización**: Todo lo relacionado a una funcionalidad está junto
7. **Navegación**: Fácil encontrar código relacionado
8. **Relaciones**: TypeORM maneja automáticamente JOINs y relaciones
9. **Validación**: class-validator valida datos automáticamente
10. **Escalabilidad**: Agregar nuevos módulos sin afectar los existentes
// assets/assets.service.ts
export class AssetsService {
  async findAll(filters) {
    return await this.assetRepository.find({ where: filters });
  }
}

// assets/assets.controller.ts
import { AssetsService } from './assets.service';
const assetsService = new AssetsService();
) {
    return await this.assetRepository.find({ where: filters });
  }
}

// assets.controller.ts
export const getAssets = async (req, res) => {
  const result = await assetsService.findAll(req.query);
  res.json(result);
};
```

## ✅ Ventajas de la Nueva Arquitectura

1. **Type Safety**: TypeScript + TypeORM detecta errores en tiempo de compilación
2. **Código Limpio**: Separación clara de responsabilidades
3. **Reutilizable**: Los servicios pueden usarse desde cualquier parte
4. **Testeable**: Fácil de crear tests unitarios y de integración
5. **Mantenible**: Estructura familiar y escalable
6. **Relaciones**: TypeORM maneja automáticamente JOINs y relaciones
7. **Validación**: class-validator valida datos automáticamente

## 📚 Recursos

- [TypeORM Documentation](https://typeorm.io/)
- [class-validator](https://github.com/typestack/class-validator)
- [Express Documentation](https://expressjs.com/)
