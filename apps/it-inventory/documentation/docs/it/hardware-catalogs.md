---
title: Catálogos de Hardware
sidebar_label: Hardware Catalogs
---

# Catálogos de Hardware (CPU, RAM, Storage)

IT Inventory incluye catálogos especializados para gestionar especificaciones técnicas de hardware, permitiendo un inventario detallado de componentes.

## 📋 Visión General

Los catálogos de hardware están organizados en 3 categorías principales:

### 🔧 **CPUs (Procesadores)**
- Modelos de procesadores
- Fabricantes (Vendors)
- Segmentos de mercado

### 💾 **RAM (Memoria)**
- Configuraciones de memoria
- Tipos de memoria (DDR3, DDR4, DDR5, etc.)
- Form factors (DIMM, SO-DIMM, etc.)

### 💿 **Storage (Almacenamiento)**
- Configuraciones de almacenamiento
- Tipos de disco (HDD, SSD, NVMe)
- Interfaces (SATA, NVMe, USB, etc.)
- Form factors (2.5", 3.5", M.2, etc.)

---

## 🔧 CPUs (Procesadores)

### Estructura de Datos

```typescript
interface AssetCPU {
  id: number;
  name: string;                    // Ej: "Intel Core i7-12700K"
  code: string;                    // Código único
  vendorId: number;                // ID del fabricante
  vendor: CPUVendor;               // Relación con vendor
  segmentId: number;               // ID del segmento
  segment: CPUSegment;             // Relación con segmento
  cores: number;                   // Número de cores
  threads: number;                 // Número de threads
  baseFrequency: number;           // Frecuencia base en GHz
  maxFrequency: number;            // Frecuencia turbo en GHz
  cache: string;                   // Ej: "25 MB L3"
  tdp: number;                     // TDP en watts
  releaseYear: number;             // Año de lanzamiento
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Listar CPUs
```http
GET /api/asset-cpu
Authorization: Bearer {token}

Query Parameters:
- vendorId: number (opcional) - Filtrar por fabricante
- segmentId: number (opcional) - Filtrar por segmento
- search: string (opcional) - Búsqueda por nombre/código
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Intel Core i7-12700K",
      "code": "i7-12700K",
      "vendor": {
        "id": 1,
        "name": "Intel",
        "code": "INTEL"
      },
      "segment": {
        "id": 1,
        "name": "Desktop",
        "code": "DESKTOP"
      },
      "cores": 12,
      "threads": 20,
      "baseFrequency": 3.6,
      "maxFrequency": 5.0,
      "cache": "25 MB L3",
      "tdp": 125,
      "releaseYear": 2021,
      "isActive": true
    }
  ]
}
```

#### Crear CPU
```http
POST /api/asset-cpu
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "AMD Ryzen 9 5950X",
  "code": "5950X",
  "vendorId": 2,
  "segmentId": 1,
  "cores": 16,
  "threads": 32,
  "baseFrequency": 3.4,
  "maxFrequency": 4.9,
  "cache": "64 MB L3",
  "tdp": 105,
  "releaseYear": 2020
}
```

#### Actualizar CPU
```http
PUT /api/asset-cpu/:id
Authorization: Bearer {token}
Content-Type: application/json
```

#### Obtener CPU por ID
```http
GET /api/asset-cpu/:id
Authorization: Bearer {token}
```

#### Listar Vendors
```http
GET /api/asset-cpu/vendors
Authorization: Bearer {token}
```

#### Listar Segmentos
```http
GET /api/asset-cpu/segments
Authorization: Bearer {token}
```

#### Exportar/Importar
```http
GET /api/asset-cpu/export/excel
GET /api/asset-cpu/template/excel
POST /api/asset-cpu/import/excel
POST /api/asset-cpu/update-duplicates-excel
```

### CPU Vendors (Fabricantes)

```typescript
interface CPUVendor {
  id: number;
  name: string;     // Ej: "Intel", "AMD", "Apple", "Qualcomm"
  code: string;     // Código único: "INTEL", "AMD", "APPLE"
  isActive: boolean;
}
```

**Endpoints:**
```http
GET    /api/asset-cpu-vendors
POST   /api/asset-cpu-vendors
PUT    /api/asset-cpu-vendors/:id
GET    /api/asset-cpu-vendors/:id
GET    /api/asset-cpu-vendors/export/excel
GET    /api/asset-cpu-vendors/template/excel
POST   /api/asset-cpu-vendors/import/excel
```

### CPU Segments (Segmentos)

```typescript
interface CPUSegment {
  id: number;
  name: string;     // Ej: "Desktop", "Mobile", "Server", "Embedded"
  code: string;     // Código único: "DESKTOP", "MOBILE"
  isActive: boolean;
}
```

**Endpoints:**
```http
GET    /api/asset-cpu-segments
POST   /api/asset-cpu-segments
PUT    /api/asset-cpu-segments/:id
GET    /api/asset-cpu-segments/:id
GET    /api/asset-cpu-segments/export/excel
GET    /api/asset-cpu-segments/template/excel
POST   /api/asset-cpu-segments/import/excel
```

---

## 💾 RAM (Memoria)

### Estructura de Datos

```typescript
interface AssetRAM {
  id: number;
  name: string;                    // Ej: "Kingston 16GB DDR4 3200MHz"
  code: string;                    // Código único
  memoryTypeId: number;            // ID del tipo de memoria
  memoryType: RAMMemoryType;       // Relación con tipo
  formFactorId: number;            // ID del form factor
  formFactor: RAMFormFactor;       // Relación con form factor
  capacityGB: number;              // Capacidad en GB
  speedMHz: number;                // Velocidad en MHz
  voltage: number;                 // Voltaje (ej: 1.2V)
  latency: string;                 // CAS Latency (ej: "CL16")
  isECC: boolean;                  // Tiene corrección de errores
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Listar RAMs
```http
GET /api/asset-ram
Authorization: Bearer {token}

Query Parameters:
- memoryTypeId: number (opcional) - Filtrar por tipo
- formFactorId: number (opcional) - Filtrar por form factor
- capacityGB: number (opcional) - Filtrar por capacidad
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kingston Fury 16GB DDR5 6000MHz",
      "code": "KF-16GB-DDR5-6000",
      "memoryType": {
        "id": 5,
        "name": "DDR5",
        "code": "DDR5"
      },
      "formFactor": {
        "id": 1,
        "name": "DIMM",
        "code": "DIMM"
      },
      "capacityGB": 16,
      "speedMHz": 6000,
      "voltage": 1.1,
      "latency": "CL36",
      "isECC": false,
      "isActive": true
    }
  ]
}
```

#### Crear RAM
```http
POST /api/asset-ram
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Corsair Vengeance 32GB DDR5",
  "code": "CV-32GB-DDR5",
  "memoryTypeId": 5,
  "formFactorId": 1,
  "capacityGB": 32,
  "speedMHz": 5600,
  "voltage": 1.1,
  "latency": "CL40",
  "isECC": false
}
```

#### Otros Endpoints
```http
PUT    /api/asset-ram/:id
GET    /api/asset-ram/:id
GET    /api/asset-ram/memory-types
GET    /api/asset-ram/form-factors
GET    /api/asset-ram/export/excel
GET    /api/asset-ram/template/excel
POST   /api/asset-ram/import/excel
POST   /api/asset-ram/update-duplicates-excel
```

### RAM Memory Types (Tipos de Memoria)

```typescript
interface RAMMemoryType {
  id: number;
  name: string;     // Ej: "DDR3", "DDR4", "DDR5", "LPDDR4X"
  code: string;     // Código único: "DDR3", "DDR4"
  isActive: boolean;
}
```

**Valores comunes:**
- DDR3
- DDR4
- DDR5
- DDR3L (Low Voltage)
- LPDDR4 (Low Power)
- LPDDR4X
- LPDDR5

**Endpoints:**
```http
GET    /api/asset-ram-memory-types
POST   /api/asset-ram-memory-types
PUT    /api/asset-ram-memory-types/:id
GET    /api/asset-ram-memory-types/:id
+ Excel endpoints
```

### RAM Form Factors

```typescript
interface RAMFormFactor {
  id: number;
  name: string;     // Ej: "DIMM", "SO-DIMM", "On-Board"
  code: string;     // Código único
  isActive: boolean;
}
```

**Valores comunes:**
- DIMM (Desktop)
- SO-DIMM (Laptop)
- MicroDIMM
- On-Board (Soldada)

**Endpoints:**
```http
GET    /api/asset-ram-form-factors
POST   /api/asset-ram-form-factors
PUT    /api/asset-ram-form-factors/:id
GET    /api/asset-ram-form-factors/:id
+ Excel endpoints
```

---

## 💿 Storage (Almacenamiento)

### Estructura de Datos

```typescript
interface AssetStorage {
  id: number;
  name: string;                    // Ej: "Samsung 980 PRO 1TB NVMe"
  code: string;                    // Código único
  driveTypeId: number;             // ID del tipo de disco
  driveType: StorageDriveType;     // Relación con tipo
  interfaceId: number;             // ID de la interface
  interface: StorageInterface;     // Relación con interface
  formFactorId: number;            // ID del form factor
  formFactor: StorageFormFactor;   // Relación con form factor
  capacityGB: number;              // Capacidad en GB
  readSpeedMBps: number;           // Velocidad lectura MB/s
  writeSpeedMBps: number;          // Velocidad escritura MB/s
  rpm: number;                     // RPM (solo para HDD)
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Listar Storage
```http
GET /api/asset-storage
Authorization: Bearer {token}

Query Parameters:
- driveTypeId: number (opcional) - Filtrar por tipo
- interfaceId: number (opcional) - Filtrar por interface
- formFactorId: number (opcional) - Filtrar por form factor
- capacityGB: number (opcional) - Filtrar por capacidad
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Samsung 990 PRO 2TB NVMe",
      "code": "SAMSUNG-990PRO-2TB",
      "driveType": {
        "id": 3,
        "name": "NVMe SSD",
        "code": "NVME"
      },
      "interface": {
        "id": 2,
        "name": "NVMe PCIe 4.0",
        "code": "NVME_PCIE4"
      },
      "formFactor": {
        "id": 3,
        "name": "M.2 2280",
        "code": "M2_2280"
      },
      "capacityGB": 2000,
      "readSpeedMBps": 7450,
      "writeSpeedMBps": 6900,
      "rpm": null,
      "isActive": true
    }
  ]
}
```

#### Crear Storage
```http
POST /api/asset-storage
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "WD Black SN850X 1TB",
  "code": "WD-SN850X-1TB",
  "driveTypeId": 3,
  "interfaceId": 2,
  "formFactorId": 3,
  "capacityGB": 1000,
  "readSpeedMBps": 7300,
  "writeSpeedMBps": 6300,
  "rpm": null
}
```

#### Otros Endpoints
```http
PUT    /api/asset-storage/:id
GET    /api/asset-storage/:id
GET    /api/asset-storage/export/excel
GET    /api/asset-storage/template/excel
POST   /api/asset-storage/import/excel
POST   /api/asset-storage/update-duplicates-excel
```

### Storage Drive Types (Tipos de Disco)

```typescript
interface StorageDriveType {
  id: number;
  name: string;     // Ej: "HDD", "SSD SATA", "NVMe SSD"
  code: string;     // Código único
  isActive: boolean;
}
```

**Valores comunes:**
- HDD (Hard Disk Drive)
- SSD SATA
- NVMe SSD
- eMMC
- SD Card
- USB Flash Drive

**Endpoints:**
```http
GET    /api/asset-storage-drive-types
POST   /api/asset-storage-drive-types
PUT    /api/asset-storage-drive-types/:id
GET    /api/asset-storage-drive-types/:id
+ Excel endpoints
```

### Storage Interfaces

```typescript
interface StorageInterface {
  id: number;
  name: string;     // Ej: "SATA III", "NVMe PCIe 4.0", "USB 3.2"
  code: string;     // Código único
  isActive: boolean;
}
```

**Valores comunes:**
- SATA II (3 Gb/s)
- SATA III (6 Gb/s)
- NVMe PCIe 3.0
- NVMe PCIe 4.0
- NVMe PCIe 5.0
- USB 3.0
- USB 3.1
- USB 3.2
- Thunderbolt 3
- Thunderbolt 4

**Endpoints:**
```http
GET    /api/asset-storage-interfaces
POST   /api/asset-storage-interfaces
PUT    /api/asset-storage-interfaces/:id
GET    /api/asset-storage-interfaces/:id
+ Excel endpoints
```

### Storage Form Factors

```typescript
interface StorageFormFactor {
  id: number;
  name: string;     // Ej: "2.5\"", "3.5\"", "M.2 2280"
  code: string;     // Código único
  isActive: boolean;
}
```

**Valores comunes:**
- 2.5" (Laptop/SSD)
- 3.5" (Desktop HDD)
- M.2 2280
- M.2 2260
- M.2 2242
- mSATA
- U.2

**Endpoints:**
```http
GET    /api/asset-storage-form-factors
POST   /api/asset-storage-form-factors
PUT    /api/asset-storage-form-factors/:id
GET    /api/asset-storage-form-factors/:id
+ Excel endpoints
```

---

## 🔗 Relaciones con Assets

Los catálogos de hardware se relacionan con los activos:

```typescript
interface Asset {
  // ... otros campos
  cpuId: number;
  cpu: AssetCPU;
  
  ramId: number;
  ram: AssetRAM;
  
  storageId: number;
  storage: AssetStorage;
}
```

---

## 📊 Casos de Uso

### Ejemplo 1: Laptop Dell con Especificaciones Completas

```json
{
  "asset": {
    "serialNumber": "DELL-001",
    "assetTag": "LAP-001",
    "type": "Laptop",
    "brand": "Dell",
    "model": "Latitude 5530",
    "cpu": {
      "name": "Intel Core i7-1265U",
      "vendor": "Intel",
      "segment": "Mobile",
      "cores": 10,
      "threads": 12,
      "baseFrequency": 1.8,
      "maxFrequency": 4.8,
      "cache": "12 MB",
      "tdp": 15
    },
    "ram": {
      "name": "Samsung 16GB DDR4 3200MHz",
      "memoryType": "DDR4",
      "formFactor": "SO-DIMM",
      "capacityGB": 16,
      "speedMHz": 3200,
      "latency": "CL22"
    },
    "storage": {
      "name": "Samsung PM991 512GB NVMe",
      "driveType": "NVMe SSD",
      "interface": "NVMe PCIe 3.0",
      "formFactor": "M.2 2280",
      "capacityGB": 512,
      "readSpeedMBps": 3500,
      "writeSpeedMBps": 2500
    }
  }
}
```

### Ejemplo 2: Desktop para Gaming

```json
{
  "asset": {
    "type": "Desktop",
    "brand": "ASUS",
    "model": "ROG Strix",
    "cpu": {
      "name": "AMD Ryzen 9 7950X",
      "vendor": "AMD",
      "segment": "Desktop",
      "cores": 16,
      "threads": 32,
      "baseFrequency": 4.5,
      "maxFrequency": 5.7
    },
    "ram": {
      "name": "G.Skill Trident Z5 64GB DDR5",
      "memoryType": "DDR5",
      "formFactor": "DIMM",
      "capacityGB": 64,
      "speedMHz": 6000
    },
    "storage": {
      "name": "WD Black SN850X 2TB",
      "driveType": "NVMe SSD",
      "interface": "NVMe PCIe 4.0",
      "formFactor": "M.2 2280",
      "capacityGB": 2000,
      "readSpeedMBps": 7300,
      "writeSpeedMBps": 6600
    }
  }
}
```

---

## 🎯 Best Practices

### 1. Nomenclatura Consistente

✅ **BIEN:**
- CPU: "Intel Core i7-12700K"
- RAM: "Kingston Fury 16GB DDR5 6000MHz"
- Storage: "Samsung 990 PRO 2TB NVMe"

❌ **MAL:**
- CPU: "i7"
- RAM: "16GB"
- Storage: "2TB SSD"

### 2. Códigos Únicos

Usa códigos descriptivos y únicos:
- CPU: `I7-12700K`, `RYZEN9-5950X`
- RAM: `KF-16GB-DDR5-6000`
- Storage: `SAMSUNG-990PRO-2TB`

### 3. Datos Completos

Completa todas las especificaciones técnicas disponibles para facilitar búsquedas y comparaciones.

### 4. Actualización Regular

Mantén los catálogos actualizados con nuevos modelos de hardware del mercado.

---

## 📖 Recursos Relacionados

- [Multi-Site Architecture](./multi-site-architecture.md)
- [Excel Import/Export](./excel-import-export.md)
- [API Reference](./api-reference.md)
- [Guía de Usuario: Catálogos](../user/catalogs-guide.md)

---

## ❓ Preguntas Frecuentes

**P: ¿Debo crear entradas para cada configuración específica de RAM?**
R: Sí, cada configuración única (capacidad + velocidad + tipo) debe tener su propia entrada para facilitar el inventario detallado.

**P: ¿Los catálogos de hardware son específicos por site?**
R: No, son globales y compartidos entre todos los sites, igual que otros catálogos.

**P: ¿Puedo agregar múltiples discos a un asset?**
R: En la versión actual, cada asset tiene un storage principal. Para múltiples discos, considera usar el campo notes o extender el modelo.

**P: ¿Es obligatorio completar todas las especificaciones técnicas?**
R: No, pero se recomienda completar al menos: nombre, código, tipo/vendor/segment, y capacidad principal (cores, GB, etc.).
