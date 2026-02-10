---
title: Sistema de Compatibilidades
sidebar_label: Compatibility System
---

# Sistema de Compatibilidades

El sistema de compatibilidades de IT Inventory permite definir relaciones válidas entre diferentes componentes de hardware y software para garantizar que solo se configuren activos con combinaciones técnicamente viables.

## 📋 Visión General

### Propósito

El sistema de compatibilidades evita configuraciones inválidas al crear o editar activos al:
- **Filtrar automáticamente** opciones de hardware/software según la marca y tipo de activo
- **Validar relaciones** entre componentes (ej: Dell + Intel CPUs permitidos, AMD bloqueados)
- **Mejorar la experiencia del usuario** mostrando solo opciones compatibles en formularios

### Ejemplo Práctico

Si un técnico selecciona:
- **Marca:** Dell
- **Tipo:** Laptop

El sistema automáticamente filtra:
- **CPUs:** Solo muestra vendors compatibles con Dell (ej: Intel, AMD)
- **Sistemas Operativos:** Solo muestra familias que Dell soporta (Windows, Linux)
- **RAM:** Solo muestra tipos de memoria compatibles con laptops Dell (DDR4, DDR5)

---

## 🏗️ Tipos de Compatibilidades

### 1. Brand-CPU Compatibility (Marca - CPU Vendor)

Define qué vendors de CPU puede usar una marca de activo específica.

**Tabla:** `asset_brand_cpu_compatibility`

**Relación:** `AssetBrand` ↔ `AssetCpuVendor` (Many-to-Many)

**Ejemplo:**
- **Dell** → Compatible con: Intel, AMD
- **Apple** → Compatible con: Apple Silicon (M1, M2, M3)
- **HP** → Compatible con: Intel, AMD

**Caso de Uso:**
Al crear un activo Dell, el formulario solo muestra CPUs de vendors Intel o AMD. Los CPUs Apple Silicon quedan automáticamente excluidos.

---

### 2. Brand-OS Compatibility (Marca - Sistema Operativo)

Define qué familias de sistemas operativos soporta una marca.

**Tabla:** `asset_brand_os_compatibility`

**Relación:** `AssetBrand` ↔ `OsFamily` (Many-to-Many)

**Ejemplo:**
- **Dell** → Windows, Linux, ChromeOS
- **Apple** → macOS, iOS
- **Lenovo** → Windows, Linux

**Caso de Uso:**
Un activo MacBook Pro solo puede tener macOS (no permite seleccionar Windows o Linux).

---

### 3. Brand-RAM Compatibility (Marca - Tipo de RAM)

Define qué tipos de memoria RAM puede usar una marca.

**Tabla:** `asset_brand_ram_compatibility`

**Relación:** `AssetBrand` ↔ `AssetRamMemoryType` (Many-to-Many)

**Ejemplo:**
- **Dell Laptops** → DDR4, DDR5, LPDDR5
- **Apple M-series** → LPDDR5 (unified memory)
- **Desktop Workstations** → DDR4, DDR5

**Caso de Uso:**
Al configurar RAM para un MacBook Air M2, solo aparece LPDDR5 como opción válida.

---

### 4. Type-OS Compatibility (Tipo - Sistema Operativo)

Define qué sistemas operativos son compatibles con un tipo de activo.

**Tabla:** `asset_type_os_compatibility`

**Relación:** `AssetType` ↔ `OsFamily` (Many-to-Many)

**Ejemplo:**
- **Laptop** → Windows, macOS, Linux, ChromeOS
- **Server** → Windows Server, Linux
- **Mobile Device** → iOS, Android

**Caso de Uso:**
Un servidor solo puede tener Windows Server o Linux (no permite macOS o Android).

---

## 📊 Modelo de Base de Datos

### Esquema de Compatibilidad Brand-CPU

```sql
CREATE TABLE asset_brand_cpu_compatibility (
  brand_id INT NOT NULL,
  cpu_vendor_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (brand_id, cpu_vendor_id),
  FOREIGN KEY (brand_id) REFERENCES asset_brand (id),
  FOREIGN KEY (cpu_vendor_id) REFERENCES asset_cpu_vendor (id),
  FOREIGN KEY (created_by) REFERENCES "user" (id)
);
```

### Esquema de Compatibilidad Brand-OS

```sql
CREATE TABLE asset_brand_os_compatibility (
  brand_id INT NOT NULL,
  os_family_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (brand_id, os_family_id),
  FOREIGN KEY (brand_id) REFERENCES asset_brand (id),
  FOREIGN KEY (os_family_id) REFERENCES os_family (id),
  FOREIGN KEY (created_by) REFERENCES "user" (id)
);
```

### Esquema de Compatibilidad Brand-RAM

```sql
CREATE TABLE asset_brand_ram_compatibility (
  brand_id INT NOT NULL,
  ram_memory_type_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (brand_id, ram_memory_type_id),
  FOREIGN KEY (brand_id) REFERENCES asset_brand (id),
  FOREIGN KEY (ram_memory_type_id) REFERENCES asset_ram_memory_type (id),
  FOREIGN KEY (created_by) REFERENCES "user" (id)
);
```

### Esquema de Compatibilidad Type-OS

```sql
CREATE TABLE asset_type_os_compatibility (
  type_id INT NOT NULL,
  os_family_id INT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (type_id, os_family_id),
  FOREIGN KEY (type_id) REFERENCES asset_type (id),
  FOREIGN KEY (os_family_id) REFERENCES os_family (id),
  FOREIGN KEY (created_by) REFERENCES "user" (id)
);
```

---

## 🔌 API Endpoints

### Brand-CPU Compatibility

#### GET /api/asset-brand-cpu-compatibility/:brandId

Obtiene vendors de CPU compatibles con una marca.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "brandId": 2,
      "cpuVendorId": 1,
      "cpuVendor": {
        "id": 1,
        "name": "Intel",
        "code": "INTEL"
      }
    },
    {
      "brandId": 2,
      "cpuVendorId": 2,
      "cpuVendor": {
        "id": 2,
        "name": "AMD",
        "code": "AMD"
      }
    }
  ]
}
```

---

#### POST /api/asset-brand-cpu-compatibility

Crea nueva compatibilidad.

**Request:**
```json
{
  "brandId": 2,
  "cpuVendorId": 1
}
```

**Permission:** `catalogs:create`

---

#### DELETE /api/asset-brand-cpu-compatibility

Elimina compatibilidad.

**Request:**
```json
{
  "brandId": 2,
  "cpuVendorId": 1
}
```

**Permission:** `catalogs:delete`

---

#### PUT /api/asset-brand-cpu-compatibility/:brandId/bulk

Actualiza todas las compatibilidades de una marca.

**Request:**
```json
{
  "cpuVendorIds": [1, 2]
}
```

**Behavior:**
1. Elimina todas las compatibilidades existentes de la marca
2. Crea nuevas compatibilidades con los IDs proporcionados

**Permission:** `catalogs:update`

---

### Brand-OS Compatibility

#### GET /api/asset-brand-os-compatibility/:brandId

Obtiene familias de OS compatibles con una marca.

---

#### POST /api/asset-brand-os-compatibility

Crea nueva compatibilidad.

**Request:**
```json
{
  "brandId": 2,
  "osFamilyId": 1
}
```

---

#### DELETE /api/asset-brand-os-compatibility

Elimina compatibilidad.

---

#### PUT /api/asset-brand-os-compatibility/:brandId/bulk

Actualiza todas las compatibilidades OS de una marca.

**Request:**
```json
{
  "osFamilyIds": [1, 2]
}
```

---

### Brand-RAM Compatibility

#### GET /api/asset-brand-ram-compatibility/:brandId

Obtiene tipos de RAM compatibles con una marca.

---

#### POST /api/asset-brand-ram-compatibility

Crea nueva compatibilidad.

**Request:**
```json
{
  "brandId": 2,
  "ramMemoryTypeId": 5
}
```

---

#### DELETE /api/asset-brand-ram-compatibility

Elimina compatibilidad.

---

#### PUT /api/asset-brand-ram-compatibility/:brandId/bulk

Actualiza todas las compatibilidades RAM de una marca.

**Request:**
```json
{
  "ramMemoryTypeIds": [4, 5]
}
```

---

### Type-OS Compatibility

#### GET /api/asset-type-os-compatibility/:typeId

Obtiene familias de OS compatibles con un tipo.

---

#### POST /api/asset-type-os-compatibility

Crea nueva compatibilidad.

**Request:**
```json
{
  "typeId": 1,
  "osFamilyId": 1
}
```

---

#### DELETE /api/asset-type-os-compatibility

Elimina compatibilidad.

---

#### PUT /api/asset-type-os-compatibility/:typeId/bulk

Actualiza todas las compatibilidades OS de un tipo.

**Request:**
```json
{
  "osFamilyIds": [1, 2, 3]
}
```

---

## 💻 Implementación Backend

### Entity: AssetBrandCpuCompatibility

```typescript
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { AssetBrand } from './asset-brand.entity';
import { AssetCpuVendor } from './asset-cpu-vendor.entity';
import { User } from './user.entity';

@Entity('asset_brand_cpu_compatibility')
export class AssetBrandCpuCompatibility {
  @PrimaryColumn({ name: 'brand_id' })
  brandId: number;

  @PrimaryColumn({ name: 'cpu_vendor_id' })
  cpuVendorId: number;

  @ManyToOne(() => AssetBrand)
  @JoinColumn({ name: 'brand_id' })
  brand: AssetBrand;

  @ManyToOne(() => AssetCpuVendor)
  @JoinColumn({ name: 'cpu_vendor_id' })
  cpuVendor: AssetCpuVendor;

  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

### Service: BrandCpuCompatibilityService

```typescript
@Injectable()
export class BrandCpuCompatibilityService {
  constructor(
    @InjectRepository(AssetBrandCpuCompatibility)
    private readonly compatibilityRepository: Repository<AssetBrandCpuCompatibility>,
  ) {}

  // Obtener compatibilidades por marca
  async getByBrand(brandId: number) {
    return this.compatibilityRepository.find({
      where: { brandId },
      relations: ['cpuVendor'],
    });
  }

  // Crear compatibilidad
  async create(dto: CreateBrandCpuCompatibilityDto, userId: number) {
    const compatibility = this.compatibilityRepository.create({
      brandId: dto.brandId,
      cpuVendorId: dto.cpuVendorId,
      createdBy: userId,
    });
    return this.compatibilityRepository.save(compatibility);
  }

  // Eliminar compatibilidad
  async delete(dto: DeleteBrandCpuCompatibilityDto) {
    await this.compatibilityRepository.delete({
      brandId: dto.brandId,
      cpuVendorId: dto.cpuVendorId,
    });
  }

  // Actualización masiva (bulk update)
  async updateBulk(brandId: number, cpuVendorIds: number[], userId: number) {
    // 1. Eliminar todas las compatibilidades existentes
    await this.compatibilityRepository.delete({ brandId });

    // 2. Crear nuevas compatibilidades
    if (cpuVendorIds && cpuVendorIds.length > 0) {
      const compatibilities = cpuVendorIds.map(cpuVendorId => ({
        brandId,
        cpuVendorId,
        createdBy: userId,
      }));
      await this.compatibilityRepository.save(compatibilities);
    }
  }
}
```

---

### Controller: BrandCpuCompatibilityController

```typescript
@ApiTags('Brand CPU Compatibility')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('asset-brand-cpu-compatibility')
export class BrandCpuCompatibilityController {
  constructor(
    private readonly compatibilityService: BrandCpuCompatibilityService
  ) {}

  @Get(':brandId')
  async getByBrand(@Param('brandId') brandId: string) {
    const data = await this.compatibilityService.getByBrand(+brandId);
    return { success: true, data };
  }

  @Post()
  async create(
    @Body() dto: CreateBrandCpuCompatibilityDto,
    @Request() req: any
  ) {
    const userId = req.user.id;
    const data = await this.compatibilityService.create(dto, userId);
    return { success: true, message: 'Compatibilidad creada', data };
  }

  @Delete()
  async delete(@Body() dto: DeleteBrandCpuCompatibilityDto) {
    await this.compatibilityService.delete(dto);
    return { success: true, message: 'Compatibilidad eliminada' };
  }

  @Put(':brandId/bulk')
  async updateBulk(
    @Param('brandId') brandId: string,
    @Body() dto: { cpuVendorIds: number[] },
    @Request() req: any
  ) {
    const userId = req.user.id;
    await this.compatibilityService.updateBulk(
      +brandId,
      dto.cpuVendorIds,
      userId
    );
    return { success: true, message: 'Compatibilidades actualizadas' };
  }
}
```

---

## 🎨 Implementación Frontend

### Service: brandCpuCompatibilityService

```typescript
// src/services/brandCpuCompatibilityService.ts
import api from './api';

export const brandCpuCompatibilityService = {
  // Obtener compatibilidades por marca
  async getByBrand(brandId: number) {
    const response = await api.get(`/asset-brand-cpu-compatibility/${brandId}`);
    return response.data;
  },

  // Crear compatibilidad
  async create(brandId: number, cpuVendorId: number) {
    const response = await api.post('/asset-brand-cpu-compatibility', {
      brandId,
      cpuVendorId,
    });
    return response.data;
  },

  // Eliminar compatibilidad
  async delete(brandId: number, cpuVendorId: number) {
    const response = await api.delete('/asset-brand-cpu-compatibility', {
      data: { brandId, cpuVendorId },
    });
    return response.data;
  },

  // Actualización masiva
  async updateBulk(brandId: number, cpuVendorIds: number[]) {
    const response = await api.put(
      `/asset-brand-cpu-compatibility/${brandId}/bulk`,
      { cpuVendorIds }
    );
    return response.data;
  },
};
```

---

### Uso en Formularios de Activos

#### 1. Filtrar CPUs por Brand

```typescript
// AssetForm.tsx
const [compatibleCpuVendors, setCompatibleCpuVendors] = useState<number[]>([]);

// Cargar compatibilidades cuando se selecciona una marca
useEffect(() => {
  if (selectedBrand) {
    loadCpuCompatibilities();
  }
}, [selectedBrand]);

const loadCpuCompatibilities = async () => {
  const response = await brandCpuCompatibilityService.getByBrand(selectedBrand);
  const vendorIds = response.data.map((c: any) => c.cpuVendorId);
  setCompatibleCpuVendors(vendorIds);
};

// Filtrar CPUs por vendors compatibles
const filteredCpus = cpus.filter(cpu =>
  compatibleCpuVendors.includes(cpu.vendorId)
);
```

---

#### 2. Filtrar OS Families por Brand y Type

```typescript
// AssetForm.tsx
const loadOsCompatibilities = async () => {
  // Obtener familias compatibles con la marca
  const brandCompat = await brandOsCompatibilityService.getByBrand(brandId);
  const brandFamilies = brandCompat.data.map((c: any) => c.osFamilyId);

  // Obtener familias compatibles con el tipo
  const typeCompat = await typeOsCompatibilityService.getByType(typeId);
  const typeFamilies = typeCompat.data.map((c: any) => c.osFamilyId);

  // Intersección: familias compatibles con AMBOS (brand Y type)
  const compatible = brandFamilies.filter(id => typeFamilies.includes(id));
  setCompatibleOsFamilies(compatible);
};

// Filtrar familias OS
const filteredOsFamilies = osFamilies.filter(family =>
  compatibleOsFamilies.includes(family.id)
);
```

---

#### 3. Filtrar RAM por Brand

```typescript
// AssetForm.tsx
const loadRamCompatibilities = async () => {
  const response = await brandRamCompatibilityService.getByBrand(brandId);
  const typeIds = response.data.map((c: any) => c.ramMemoryTypeId);
  setCompatibleRamTypes(typeIds);
};

// Filtrar opciones RAM
const filteredRamOptions = ramOptions.filter(ram =>
  compatibleRamTypes.includes(ram.memoryTypeId)
);
```

---

### Componente de Gestión de Compatibilidades

```typescript
// BrandCompatibilitiesForm.tsx
interface Props {
  brandId: number;
}

export function BrandCompatibilitiesForm({ brandId }: Props) {
  const [selectedCpuVendors, setSelectedCpuVendors] = useState<number[]>([]);
  const [selectedOsFamilies, setSelectedOsFamilies] = useState<number[]>([]);
  const [selectedRamTypes, setSelectedRamTypes] = useState<number[]>([]);

  // Cargar compatibilidades existentes
  useEffect(() => {
    loadCompatibilities();
  }, [brandId]);

  const loadCompatibilities = async () => {
    const [cpu, os, ram] = await Promise.all([
      brandCpuCompatibilityService.getByBrand(brandId),
      brandOsCompatibilityService.getByBrand(brandId),
      brandRamCompatibilityService.getByBrand(brandId),
    ]);

    setSelectedCpuVendors(cpu.data.map((c: any) => c.cpuVendorId));
    setSelectedOsFamilies(os.data.map((c: any) => c.osFamilyId));
    setSelectedRamTypes(ram.data.map((c: any) => c.ramMemoryTypeId));
  };

  const handleSave = async () => {
    await Promise.all([
      brandCpuCompatibilityService.updateBulk(brandId, selectedCpuVendors),
      brandOsCompatibilityService.updateBulk(brandId, selectedOsFamilies),
      brandRamCompatibilityService.updateBulk(brandId, selectedRamTypes),
    ]);

    toast.success('Compatibilidades actualizadas');
  };

  return (
    <div className="space-y-6">
      {/* CPU Vendors */}
      <div>
        <h3>CPU Vendors Compatibles</h3>
        <CheckboxGroup
          options={cpuVendors}
          selected={selectedCpuVendors}
          onChange={setSelectedCpuVendors}
        />
      </div>

      {/* OS Families */}
      <div>
        <h3>Sistemas Operativos Compatibles</h3>
        <CheckboxGroup
          options={osFamilies}
          selected={selectedOsFamilies}
          onChange={setSelectedOsFamilies}
        />
      </div>

      {/* RAM Types */}
      <div>
        <h3>Tipos de RAM Compatibles</h3>
        <CheckboxGroup
          options={ramMemoryTypes}
          selected={selectedRamTypes}
          onChange={setSelectedRamTypes}
        />
      </div>

      <button onClick={handleSave}>Guardar Compatibilidades</button>
    </div>
  );
}
```

---

## 📋 Escenarios de Uso

### Escenario 1: Crear Laptop Dell

**Flujo:**
1. Usuario selecciona **Marca:** Dell
2. Sistema carga compatibilidades de Dell:
   - CPU Vendors: Intel, AMD
   - OS Families: Windows, Linux
   - RAM Types: DDR4, DDR5, LPDDR5
3. Usuario selecciona **Tipo:** Laptop
4. Sistema filtra OS por tipo también (Laptop soporta Windows, macOS, Linux)
5. OS Families finales (intersección): **Windows, Linux**
6. Dropdowns muestran solo opciones compatibles:
   - CPU: Solo muestra Intel Core i7-1265U, AMD Ryzen 7 5800U, etc.
   - OS: Solo muestra Windows 11, Ubuntu 22.04, etc.
   - RAM: Solo DDR4, DDR5, LPDDR5

---

### Escenario 2: MacBook Pro M3

**Flujo:**
1. Usuario selecciona **Marca:** Apple
2. Compatibilidades:
   - CPU Vendors: Apple Silicon
   - OS Families: macOS
   - RAM Types: LPDDR5
3. Usuario selecciona **Tipo:** Laptop
4. Dropdowns filtrados:
   - CPU: Solo Apple M3, M3 Pro, M3 Max
   - OS: Solo macOS Sonoma, Ventura
   - RAM: Solo LPDDR5 (unified memory)

---

### Escenario 3: Servidor Dell

**Flujo:**
1. Usuario selecciona **Marca:** Dell
2. Usuario selecciona **Tipo:** Server
3. Sistema combina compatibilidades:
   - CPU: Intel Xeon, AMD EPYC (Dell soporta ambos)
   - OS: Windows Server, Linux (Server solo permite estos)
   - RAM: DDR4, DDR5 ECC (servidores requieren ECC)

---

## 🔒 Validaciones y Reglas

### Validación en Backend

```typescript
// assets.service.ts
async validateAssetConfiguration(dto: CreateAssetDto) {
  // 1. Verificar CPU vendor compatible con brand
  const cpu = await this.cpuRepository.findOne({ where: { id: dto.cpuId } });
  const cpuCompatibility = await this.brandCpuCompatibilityRepository.findOne({
    where: {
      brandId: dto.brandId,
      cpuVendorId: cpu.vendorId,
    },
  });

  if (!cpuCompatibility) {
    throw new BadRequestException(
      `El vendor de CPU ${cpu.vendor.name} no es compatible con la marca seleccionada`
    );
  }

  // 2. Verificar OS family compatible con brand y type
  const osVersion = await this.osVersionRepository.findOne({
    where: { id: dto.osVersionId },
    relations: ['family'],
  });

  const brandOsCompat = await this.brandOsCompatibilityRepository.findOne({
    where: {
      brandId: dto.brandId,
      osFamilyId: osVersion.family.id,
    },
  });

  const typeOsCompat = await this.typeOsCompatibilityRepository.findOne({
    where: {
      typeId: dto.typeId,
      osFamilyId: osVersion.family.id,
    },
  });

  if (!brandOsCompat || !typeOsCompat) {
    throw new BadRequestException(
      `El sistema operativo ${osVersion.family.name} no es compatible`
    );
  }

  // 3. Verificar RAM type compatible con brand
  const ram = await this.ramRepository.findOne({ where: { id: dto.ramId } });
  const ramCompatibility = await this.brandRamCompatibilityRepository.findOne({
    where: {
      brandId: dto.brandId,
      ramMemoryTypeId: ram.memoryTypeId,
    },
  });

  if (!ramCompatibility) {
    throw new BadRequestException(
      `El tipo de RAM ${ram.memoryType.name} no es compatible con la marca`
    );
  }

  return true;
}
```

---

### Validación en Frontend

```typescript
// AssetForm.tsx
const validateCompatibilities = () => {
  const errors: string[] = [];

  // Validar CPU
  const cpu = cpus.find(c => c.id === selectedCpu);
  if (!compatibleCpuVendors.includes(cpu.vendorId)) {
    errors.push('CPU vendor no compatible con la marca seleccionada');
  }

  // Validar OS
  const osVersion = osVersions.find(v => v.id === selectedOsVersion);
  if (!compatibleOsFamilies.includes(osVersion.familyId)) {
    errors.push('Sistema operativo no compatible');
  }

  // Validar RAM
  const ram = ramOptions.find(r => r.id === selectedRam);
  if (!compatibleRamTypes.includes(ram.memoryTypeId)) {
    errors.push('Tipo de RAM no compatible con la marca');
  }

  if (errors.length > 0) {
    toast.error(errors.join(', '));
    return false;
  }

  return true;
};
```

---

## 🛡️ Permisos Requeridos

| Acción | Permiso |
|--------|---------|
| Leer compatibilidades | `catalogs:read` |
| Crear compatibilidad | `catalogs:create` |
| Actualizar compatibilidades (bulk) | `catalogs:update` |
| Eliminar compatibilidad | `catalogs:delete` |

---

## 🎯 Mejores Prácticas

### 1. Configurar Compatibilidades al Crear Marcas

Siempre definir compatibilidades inmediatamente después de crear una marca nueva:

```typescript
// Crear marca Dell
const dell = await brandService.create({ name: 'Dell', code: 'DELL' });

// Configurar compatibilidades
await brandCpuCompatibilityService.updateBulk(dell.id, [1, 2]); // Intel, AMD
await brandOsCompatibilityService.updateBulk(dell.id, [1, 2]); // Windows, Linux
await brandRamCompatibilityService.updateBulk(dell.id, [4, 5]); // DDR4, DDR5
```

---

### 2. Usar Actualizaciones Bulk

Preferir `updateBulk` sobre múltiples `create`/`delete`:

```typescript
// ❌ EVITAR (múltiples requests)
await compatibilityService.delete(brandId, 1);
await compatibilityService.delete(brandId, 2);
await compatibilityService.create(brandId, 3);
await compatibilityService.create(brandId, 4);

// ✅ PREFERIR (single request)
await compatibilityService.updateBulk(brandId, [3, 4]);
```

---

### 3. Cachear Compatibilidades en Frontend

```typescript
// useCompatibilities.ts
const { data: cpuCompatibilities } = useQuery({
  queryKey: ['brand-cpu-compatibility', brandId],
  queryFn: () => brandCpuCompatibilityService.getByBrand(brandId),
  enabled: !!brandId,
  staleTime: 5 * 60 * 1000, // Cache por 5 minutos
});
```

---

### 4. Validar ANTES de Enviar al Backend

```typescript
// AssetForm.tsx
const handleSubmit = async (data: FormData) => {
  // Validar compatibilidades en frontend primero
  if (!validateCompatibilities()) {
    return;
  }

  // Si pasa validación frontend, enviar al backend
  await assetService.create(data);
};
```

---

## 📊 Datos Recomendados

### Compatibilidades Típicas por Marca

#### Dell
- **CPU:** Intel, AMD
- **OS:** Windows, Linux, ChromeOS
- **RAM:** DDR4, DDR5, LPDDR5

#### Apple
- **CPU:** Apple Silicon
- **OS:** macOS
- **RAM:** LPDDR5 (unified memory)

#### HP
- **CPU:** Intel, AMD
- **OS:** Windows, Linux
- **RAM:** DDR4, DDR5, LPDDR4

#### Lenovo
- **CPU:** Intel, AMD
- **OS:** Windows, Linux
- **RAM:** DDR4, DDR5, LPDDR5

---

### Compatibilidades Típicas por Tipo

#### Laptop
- **OS:** Windows, macOS, Linux, ChromeOS

#### Desktop
- **OS:** Windows, macOS, Linux

#### Server
- **OS:** Windows Server, Linux

#### Mobile Device
- **OS:** iOS, Android

---

## 📖 Recursos Relacionados

- [Hardware Catalogs](./hardware-catalogs.md) - Detalles de CPUs, RAM, Storage
- [API Reference](./api-reference.md) - Endpoints completos
- [Catalogs Guide](../user/catalogs-guide.md) - Guía de usuario
- [Multi-Site Architecture](./multi-site-architecture.md) - Arquitectura multi-site
