-- =========================================
-- SEEDS
-- =========================================


-- =========================================
-- Usuario admin ejemplo
-- =========================================
-- Insertar primer usuario sin created_by (NULL)
INSERT INTO app_users (user_name, email, password_hash)
VALUES 
('Iván', 'ilopez@parcelontime.es', '$2a$10$xfRRNyRHfWV4N2wxqab2r.gKVcFFS7BfUNxONbk/bymkTJQrv4DPy'),
('Test viewer', 'viewer@parcelontime.es', '$2a$10$xfRRNyRHfWV4N2wxqab2r.gKVcFFS7BfUNxONbk/bymkTJQrv4DPy')
ON CONFLICT (email) DO NOTHING;

-- Actualizar el primer usuario para que se haya creado a sí mismo
UPDATE app_users SET created_by = 1 WHERE id = 1;

-- Sites
INSERT INTO sites (code, name, created_by)
VALUES
  ('POT', 'Parcel on time S.R.L.', 1),
  ('SCAMP', 'SCAMP S.L.', 1)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, is_active = TRUE;

-- Roles
INSERT INTO roles (code, name, created_by)
VALUES
  ('admin', 'Administrador', 1),
  ('it', 'Técnico IT', 1),
  ('viewer', 'Solo lectura', 1)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, is_active = TRUE;

-- Asset Statuses
INSERT INTO asset_statuses (code, name, color_class, sort_order, created_by) VALUES
  ('in_stock', 'En Stock', 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 10, 1),
  ('assigned', 'Asignado', 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 20, 1),
  ('repair', 'En Reparación', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 30, 1),
  ('retired', 'Retirado', 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 40, 1),
  ('EnvoiDuNet', 'EnvoiDuNet', 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', 50, 1)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    color_class = EXCLUDED.color_class,
    sort_order = EXCLUDED.sort_order,
    is_active = TRUE;

-- Maintenance Types (global)
INSERT INTO asset_maintenance_types (code, name, description, sort_order, created_by) VALUES
  ('printer_cleaning', 'Limpieza impresora', 'Limpieza general y cabezales', 10, 1),
  ('printer_check', 'Revision impresora', 'Revision de componentes y rodillos', 20, 1),
  ('update', 'Actualizacion', 'Actualizacion de firmware o software', 30, 1)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    is_active = TRUE;

-- Permisos

-- Permisos de activos y empleados

INSERT INTO permissions (code, name, created_by)
VALUES
  -- Assets
  ('assets.read', 'Ver activos', 1),
  ('assets.create', 'Crear activo', 1),
  ('assets.update', 'Editar activo', 1),
  ('assets.delete', 'Eliminar activo', 1),
  ('assets.retire', 'Dar de baja activo', 1),
  
  -- Assignments
  ('assignments.read', 'Ver asignaciones', 1),
  ('assignments.create', 'Crear asignación', 1),
  ('assignments.update', 'Editar asignación', 1),
  ('assignments.delete', 'Eliminar asignación', 1),
  
  -- Employees
  ('employees.read', 'Ver empleados', 1),
  ('employees.create', 'Crear empleado', 1),
  ('employees.update', 'Editar empleado', 1),
  ('employees.delete', 'Eliminar empleado', 1),
  
  -- Catalogs: Asset Models
  ('assetModels.read', 'Ver modelos de activo', 1),
  ('assetModels.create', 'Crear modelo de activo', 1),
  ('assetModels.update', 'Editar modelo de activo', 1),
  ('assetModels.delete', 'Eliminar modelo de activo', 1),
  
  -- Catalogs: Asset Brands
  ('assetBrands.read', 'Ver marcas de activo', 1),
  ('assetBrands.create', 'Crear marca de activo', 1),
  ('assetBrands.update', 'Editar marca de activo', 1),
  ('assetBrands.delete', 'Eliminar marca de activo', 1),
  
  -- Catalogs: Asset Types
  ('assetTypes.read', 'Ver tipos de activo', 1),
  ('assetTypes.create', 'Crear tipo de activo', 1),
  ('assetTypes.update', 'Editar tipo de activo', 1),
  ('assetTypes.delete', 'Eliminar tipo de activo', 1),
  
  -- Catalogs: OS Families
  ('assetOsFamilies.read', 'Ver familias de OS', 1),
  ('assetOsFamilies.create', 'Crear familia de OS', 1),
  ('assetOsFamilies.update', 'Editar familia de OS', 1),
  ('assetOsFamilies.delete', 'Eliminar familia de OS', 1),
  
  -- Catalogs: OS Versions
  ('osVersions.read', 'Ver versiones de OS', 1),
  ('osVersions.create', 'Crear versión de OS', 1),
  ('osVersions.update', 'Editar versión de OS', 1),
  ('osVersions.delete', 'Eliminar versión de OS', 1),
  
  -- Catalogs: CPU
  ('assetCPU.read', 'Ver modelos de CPU', 1),
  ('assetCPU.create', 'Crear modelo de CPU', 1),
  ('assetCPU.update', 'Editar modelo de CPU', 1),
  ('assetCPU.delete', 'Eliminar modelo de CPU', 1),
  
  -- Catalogs: RAM
  ('assetRAM.read', 'Ver opciones de RAM', 1),
  ('assetRAM.create', 'Crear opción de RAM', 1),
  ('assetRAM.update', 'Editar opción de RAM', 1),
  ('assetRAM.delete', 'Eliminar opción de RAM', 1),
  
  -- Catalogs: Storage
  ('assetStorage.read', 'Ver opciones de almacenamiento', 1),
  ('assetStorage.create', 'Crear opción de almacenamiento', 1),
  ('assetStorage.update', 'Editar opción de almacenamiento', 1),
  ('assetStorage.delete', 'Eliminar opción de almacenamiento', 1),
  
  -- Catalogs: Sections
  ('sections.read', 'Ver secciones', 1),
  ('sections.create', 'Crear sección', 1),
  ('sections.update', 'Editar sección', 1),
  ('sections.delete', 'Eliminar sección', 1),

  -- Catalogs: Maintenance Types
  ('maintenanceTypes.read', 'Ver tipos de mantenimiento', 1),
  ('maintenanceTypes.create', 'Crear tipo de mantenimiento', 1),
  ('maintenanceTypes.update', 'Editar tipo de mantenimiento', 1),
  ('maintenanceTypes.delete', 'Eliminar tipo de mantenimiento', 1),

  -- Catalogs: Holidays
  ('holidays.read', 'Ver festivos', 1),
  ('holidays.create', 'Crear festivo', 1),
  ('holidays.update', 'Editar festivo', 1),
  ('holidays.delete', 'Eliminar festivo', 1),
  
  -- Users and Roles
  ('users.read', 'Ver usuarios', 1),
  ('users.create', 'Crear usuario', 1),
  ('users.update', 'Editar usuario', 1),
  ('users.delete', 'Eliminar usuario', 1),
  
  ('roles.read', 'Ver roles', 1),
  ('roles.create', 'Crear rol', 1),
  ('roles.update', 'Editar rol', 1),
  ('roles.delete', 'Eliminar rol', 1),
  
  ('permissions.read', 'Ver permisos', 1),
  ('permissions.create', 'Crear permiso', 1),
  ('permissions.update', 'Editar permiso', 1),
  ('permissions.delete', 'Eliminar permiso', 1),
  
  -- Sites
  ('sites.read', 'Ver sitios', 1),
  ('sites.create', 'Crear sitio', 1),
  ('sites.update', 'Editar sitio', 1),
  ('sites.delete', 'Eliminar sitio', 1),
  
  -- System
  ('system.admin', 'Administrador del sistema (acceso total)', 1),
  ('system.read', 'Ver configuración del sistema', 1)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, is_active = TRUE;


-- admin -> todos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;


-- it -> operativos (todos los permisos excepto system.admin y gestión de usuarios/roles/permisos/sites)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
  -- Assets
  'assets.read','assets.create','assets.update','assets.delete','assets.retire',
  -- Assignments
  'assignments.read','assignments.create','assignments.update','assignments.delete',
  -- Employees
  'employees.read','employees.create','employees.update','employees.delete',
  -- Catalogs
  'assetModels.read','assetModels.create','assetModels.update','assetModels.delete',
  'assetBrands.read','assetBrands.create','assetBrands.update','assetBrands.delete',
  'assetTypes.read','assetTypes.create','assetTypes.update','assetTypes.delete',
  'assetOsFamilies.read','assetOsFamilies.create','assetOsFamilies.update','assetOsFamilies.delete',
  'osVersions.read','osVersions.create','osVersions.update','osVersions.delete',
  'assetCPU.read','assetCPU.create','assetCPU.update','assetCPU.delete',
  'assetRAM.read','assetRAM.create','assetRAM.update','assetRAM.delete',
  'assetStorage.read','assetStorage.create','assetStorage.update','assetStorage.delete',
  'sections.read','sections.create','sections.update','sections.delete',
  'maintenanceTypes.read','maintenanceTypes.create','maintenanceTypes.update','maintenanceTypes.delete',
  'holidays.read','holidays.create','holidays.update','holidays.delete',
  -- System read only
  'system.read'
)
WHERE r.code = 'it'
ON CONFLICT DO NOTHING;


-- viewer -> lectura
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('assets.read', 'employees.read')
WHERE r.code = 'viewer'
ON CONFLICT DO NOTHING;

-- asset_types (global)
INSERT INTO asset_types (name, sort_order, is_assignable, supports_os, created_by)
VALUES
  ('PC', 10, FALSE, TRUE, 1),
  ('PC portátil', 15, TRUE, TRUE, 1),
  ('Workstation', 20, FALSE, TRUE, 1),
  ('Mobile phone', 30, TRUE, TRUE, 1),
  ('Tablet', 35, TRUE, TRUE, 1),
  ('PDA', 40, TRUE, TRUE, 1),
  ('Monitor', 50, FALSE, FALSE, 1),
  ('Docking station', 55, FALSE, FALSE, 1),
  ('Printer A4', 60, FALSE, FALSE, 1),
  ('Printer A6', 65, FALSE, FALSE, 1),
  ('Barcode scanner', 80, FALSE, FALSE, 1),
  ('Camera packing', 90, FALSE, FALSE, 1),
  ('Keyboard', 95, FALSE, FALSE, 1),
  ('Mouse', 100, FALSE, FALSE, 1),
  ('Switch', 110, FALSE, FALSE, 1),
  ('Router', 120, FALSE, FALSE, 1),
  ('Access point', 130, FALSE, FALSE, 1),
  ('Firewall', 140, FALSE, FALSE, 1),
  ('UPS', 150, FALSE, FALSE, 1),
  ('Server', 160, FALSE, TRUE, 1)
ON CONFLICT (name) DO UPDATE
SET sort_order    = EXCLUDED.sort_order,
    is_assignable = EXCLUDED.is_assignable,
    supports_os   = EXCLUDED.supports_os,
    is_active     = TRUE;

-- sections POR SITE
INSERT INTO sections (site_id, name, sort_order, created_by)
SELECT s.site_id, x.name, x.sort_order, 1
FROM sites s
CROSS JOIN (VALUES
  ('Oficina', 10),
  ('Oficina BOX', 20),
  ('Oficina SHOP', 30),
  ('Picking', 40),
  ('Packing', 50),
  ('Clasificadores', 60),
  ('Recepción', 70),
  ('Toreros', 80),
  ('Expediciones', 90),
  ('Stock', 100),
  ('IT / Taller', 110),
  ('Sala servidores', 120),
  ('Movilidad', 130),
  ('Depots', 140),
  ('Devoluciones', 150)
) AS x(name, sort_order)
ON CONFLICT (site_id, name) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    is_active = TRUE;

-- OS (global)
INSERT INTO os_families (name, created_by)
VALUES 
  ('Windows', 1),
  ('Android', 1),
  ('iOS', 1),
  ('Linux', 1),
  ('macOS', 1),
  ('VMWare', 1)
ON CONFLICT (name) DO UPDATE
SET is_active = TRUE;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 10 Pro 22H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 11 Pro 23H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 11 Pro 24H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 11 Pro 25H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Android 10', 1 FROM os_families WHERE name='Android'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Android 12', 1 FROM os_families WHERE name='Android'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Android 14', 1 FROM os_families WHERE name='Android'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 16', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 16.1', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 16.2', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 17', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 17.1', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 17.2', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 18', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 18.1', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 18.2', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 26', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 26.1', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'iOS 26.2', 1 FROM os_families WHERE name='iOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'macOS Sequoia 15.7.3', 1 FROM os_families WHERE name='macOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'macOS Tahoe 26', 1 FROM os_families WHERE name='macOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'macOS Tahoe 26.1', 1 FROM os_families WHERE name='macOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'macOS Tahoe 26.2', 1 FROM os_families WHERE name='macOS'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 10 Home 22H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 11 Home 23H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 11 Home 24H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

INSERT INTO os_versions (os_family_id, name, created_by)
SELECT id, 'Windows 11 Home 25H2', 1 FROM os_families WHERE name='Windows'
ON CONFLICT DO NOTHING;

-- asset_brands (global)
INSERT INTO asset_brands (name, created_by)
VALUES
  ('Zebra', 1),('Unitech', 1),('HP', 1),('HPE', 1),('Dell', 1),('Lenovo', 1),('Apple', 1),
  ('Samsung', 1),('Xiaomi', 1),('Ubiquiti', 1),('MikroTik', 1),('Cisco', 1),('TP-Link', 1),
  ('Brother', 1),('Epson', 1),('OKI', 1),('Logitech', 1),('MSI', 1),('SATO', 1),('TSC', 1),
  ('AXIS', 1),('DataLogic', 1),('AXON Micrelec', 1),('CyberPower', 1),('Synology', 1),
  ('Genérico', 1),('PCCom', 1)
ON CONFLICT (name) DO UPDATE
SET is_active = TRUE;

-- asset_models (ejemplo)
INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'MacBook Pro M3 Max 16-inch', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Apple'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'Mac mini M2', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Apple'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'ThinkCentre M70q Gen 5 Desktop - 12TD000GSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'MacBook Pro Intel Core i7 16-inch', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Apple'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'ThinkCentre M70q Gen 2 - 11MY002USP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'V30a-24IML - 11FT000PSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'V15 G4 IRU - 83A1002CSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'ThinkPad L16 Gen 1 - 21L3002JSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'ThinkCentre M70q - 11DT003HSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'Vostro 15 3510', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Dell'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'ThinkCentre M90q Gen 4 - 12EH0007SP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'V15 G2-ITL - 82KB00N2SP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'Bronze Intel Core i5-12400F/16GB/500GB SSD/GTX 1650', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'PCCom'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'V30a-22IIL - 11LC0008SP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'V30a-24IIL - 11LA000FSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'V30a-24IIL - 11LA000PSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'V15 G2-ITL - 82KB010HSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'Vostro 3501', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Dell'
WHERE t.name = 'PC portátil'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'PC a medida', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Genérico'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

INSERT INTO asset_models (type_id, brand_id, model, created_by)
SELECT t.id, b.id, 'IdeaCentre AIO 3-24ALC6 - F0G100JLSP', 1
FROM asset_types t
JOIN asset_brands b ON b.name = 'Lenovo'
WHERE t.name = 'PC'
ON CONFLICT (type_id, brand_id, model) DO NOTHING;

-- =========================================
-- SEEDS: Catálogos de opciones de hardware
-- =========================================

-- CPU Vendors
INSERT INTO asset_cpu_vendors (code, name, created_by) VALUES
  ('intel', 'Intel', 1),
  ('amd', 'AMD', 1),
  ('apple', 'Apple', 1),
  ('other', 'Other', 1);

-- CPU Segments
INSERT INTO asset_cpu_segments (code, name, created_by) VALUES
  ('desktop', 'Desktop', 1),
  ('mobile', 'Mobile', 1),
  ('server', 'Server', 1),
  ('soc', 'SoC', 1),
  ('other', 'Other', 1);

-- RAM Memory Types
INSERT INTO asset_ram_memory_types (code, name, created_by) VALUES
  ('ddr3', 'DDR3', 1),
  ('ddr4', 'DDR4', 1),
  ('ddr5', 'DDR5', 1),
  ('lpddr4x', 'LPDDR4X', 1),
  ('lpddr5', 'LPDDR5', 1),
  ('lpddr5x', 'LPDDR5X', 1),
  ('unified', 'Unified', 1),
  ('other', 'Other', 1);

-- RAM Form Factors
INSERT INTO asset_ram_form_factors (code, name, created_by) VALUES
  ('dimm', 'DIMM', 1),
  ('sodimm', 'SO-DIMM', 1),
  ('onboard', 'Onboard', 1),
  ('other', 'Other', 1);

-- Storage Drive Types
INSERT INTO asset_storage_drive_types (code, name, created_by) VALUES
  ('ssd', 'SSD', 1),
  ('hdd', 'HDD', 1),
  ('other', 'Other', 1);

-- Storage Interfaces
INSERT INTO asset_storage_interfaces (code, name, created_by) VALUES
  ('nvme', 'NVMe', 1),
  ('sata', 'SATA', 1),
  ('sas', 'SAS', 1),
  ('usb', 'USB', 1),
  ('other', 'Other', 1);

-- Storage Form Factors
INSERT INTO asset_storage_form_factors (code, name, created_by) VALUES
  ('m2', 'M.2', 1),
  ('2.5', '2.5"', 1),
  ('3.5', '3.5"', 1),
  ('u2', 'U.2', 1),
  ('other', 'Other', 1);

-- =========================================
-- SEEDS CPU (con cores/threads + base/boost)
-- =========================================
INSERT INTO asset_cpus (vendor_id, model, segment_id, cores, threads, base_ghz, boost_ghz, created_by)
SELECT v.id, cpu_data.model, s.id, cpu_data.cores, cpu_data.threads, cpu_data.base_ghz, cpu_data.boost_ghz, cpu_data.created_by
FROM (VALUES
  -- Intel 4th Gen (legacy)
  ('intel','Core i5-4460','desktop',4,4,3.20,3.40,1),

  -- Intel 9th Gen
  ('intel','Core i3-9100','desktop',4,4,3.60,4.20,1),
  ('intel','Core i5-9400','desktop',6,6,2.90,4.10,1),
  ('intel','Core i5-9600K','desktop',6,6,3.70,4.60,1),
  ('intel','Core i7-9700','desktop',8,8,3.00,4.70,1),
  ('intel','Core i7-9700K','desktop',8,8,3.60,4.90,1),

  -- Intel 9th Gen mobile (H series)
  ('intel','Core i7-9750H','mobile',6,12,2.60,4.50,1),

  -- Intel 9th Gen
  ('intel','Core i9-9900','desktop',8,16,3.10,5.00,1),
  ('intel','Core i9-9900K','desktop',8,16,3.60,5.00,1),

  -- Intel 10th Gen
  ('intel','Core i3-10100','desktop',4,8,3.60,4.30,1),
  ('intel','Core i3-10100T','desktop',4,8,3.00,3.80,1),
  ('intel','Core i5-10400','desktop',6,12,2.90,4.30,1),
  ('intel','Core i5-10500','desktop',6,12,3.10,4.50,1),
  ('intel','Core i5-10600K','desktop',6,12,4.10,4.80,1),
  ('intel','Core i7-10700','desktop',8,16,2.90,4.80,1),
  ('intel','Core i7-10700K','desktop',8,16,3.80,5.10,1),
  ('intel','Core i9-10900','desktop',10,20,2.80,5.20,1),
  ('intel','Core i9-10900K','desktop',10,20,3.70,5.30,1),

  -- Intel 10th Gen mobile (U / G series)
  ('intel','Core i3-10110U','mobile',2,4,2.10,4.10,1),
  ('intel','Core i3-1005G1','mobile',2,4,1.20,3.40,1),
  ('intel','Core i5-1035G1','mobile',4,8,1.00,3.60,1),
  ('intel','Core i5-10210U','mobile',4,8,1.60,4.20,1),
  ('intel','Core i7-10510U','mobile',4,8,1.80,4.90,1),

  -- Intel 11th Gen mobile
  ('intel','Core i3-1115G4','mobile',2,4,3.00,4.10,1),
  ('intel','Core i5-1135G7','mobile',4,8,2.40,4.20,1),
  ('intel','Core i7-1165G7','mobile',4,8,2.80,4.70,1),

  -- Intel 11th Gen desktop
  ('intel','Core i5-11400','desktop',6,12,2.60,4.40,1),
  ('intel','Core i5-11400T','desktop',6,12,1.30,3.70,1),
  ('intel','Core i7-11700','desktop',8,16,2.50,4.90,1),
  ('intel','Core i9-11900','desktop',8,16,2.50,5.20,1),

  -- Intel 12th Gen desktop (E+P: “cores”=totales)
  ('intel','Core i3-12100','desktop',4,8,3.30,4.30,1),
  ('intel','Core i5-12400','desktop',6,12,2.50,4.40,1),
  ('intel','Core i5-12400F','desktop',6,12,2.50,4.40,1),
  ('intel','Core i5-12500','desktop',6,12,3.00,4.60,1),
  ('intel','Core i7-12700','desktop',12,20,2.10,4.90,1),
  ('intel','Core i9-12900','desktop',16,24,2.40,5.10,1),

  -- Intel 12th Gen mobile
  ('intel','Core i5-1235U','mobile',10,12,1.30,4.40,1),
  ('intel','Core i7-1255U','mobile',10,12,1.70,4.70,1),

  -- Intel 13th Gen desktop
  ('intel','Core i3-13100','desktop',4,8,3.40,4.50,1),
  ('intel','Core i5-13400','desktop',10,16,2.50,4.60,1),
  ('intel','Core i5-13500','desktop',14,20,2.50,4.80,1),
  ('intel','Core i7-13700','desktop',16,24,2.10,5.20,1),
  ('intel','Core i9-13900','desktop',24,32,2.00,5.60,1),

  -- Intel 13th Gen mobile
  ('intel','Core i3-1315U','mobile',6,8,1.20,4.50,1),
  ('intel','Core i5-1335U','mobile',10,12,1.30,4.60,1),
  ('intel','Core i7-1355U','mobile',10,12,1.70,5.00,1),

  -- Intel 14th Gen desktop
  ('intel','Core i3-14100','desktop',4,8,3.50,4.70,1),
  ('intel','Core i5-14400T','desktop',10,16,1.50,4.50,1),
  ('intel','Core i5-14600K','desktop',14,20,3.50,5.30,1),
  ('intel','Core i7-14700','desktop',20,28,2.10,5.40,1),
  ('intel','Core i9-14900','desktop',24,32,2.00,5.80,1),

  -- Intel mobile (2023/2024 típicos empresa)
  ('intel','Core Ultra 5 125U','mobile',12,14,1.30,4.30,1),
  ('intel','Core Ultra 5 125H','mobile',14,18,1.20,4.50,1),
  ('intel','Core Ultra 7 155H','mobile',16,22,1.40,4.80,1),

  -- AMD (2019 -> hoy)
  ('amd','Ryzen 3 3200G','desktop',4,4,3.60,4.00,1),
  ('amd','Ryzen 5 3400G','desktop',4,8,3.70,4.20,1),
  ('amd','Ryzen 5 3600','desktop',6,12,3.60,4.20,1),
  ('amd','Ryzen 7 3700X','desktop',8,16,3.60,4.40,1),
  ('amd','Ryzen 9 3900X','desktop',12,24,3.80,4.60,1),

  ('amd','Ryzen 5 4600G','desktop',6,12,3.70,4.20,1),
  ('amd','Ryzen 7 4700G','desktop',8,16,3.60,4.40,1),

  ('amd','Ryzen 5 5600','desktop',6,12,3.50,4.40,1),
  ('amd','Ryzen 5 5600X','desktop',6,12,3.70,4.60,1),
  ('amd','Ryzen 7 5700X','desktop',8,16,3.40,4.60,1),
  ('amd','Ryzen 7 5800X','desktop',8,16,3.80,4.70,1),
  ('amd','Ryzen 7 5800X3D','desktop',8,16,3.40,4.50,1),
  ('amd','Ryzen 9 5900X','desktop',12,24,3.70,4.80,1),
  ('amd','Ryzen 9 5950X','desktop',16,32,3.40,4.90,1),

  ('amd','Ryzen 5 5500U','mobile',6,12,2.10,4.00,1),
  ('amd','Ryzen 5 6600U','mobile',6,12,2.90,4.50,1),
  ('amd','Ryzen 7 6800U','mobile',8,16,2.70,4.70,1),

  ('amd','Ryzen 5 7600','desktop',6,12,3.80,5.10,1),
  ('amd','Ryzen 5 7600X','desktop',6,12,4.70,5.30,1),
  ('amd','Ryzen 7 7700','desktop',8,16,3.80,5.30,1),
  ('amd','Ryzen 7 7700X','desktop',8,16,4.50,5.40,1),
  ('amd','Ryzen 7 7800X3D','desktop',8,16,4.20,5.00,1),
  ('amd','Ryzen 9 7900','desktop',12,24,3.70,5.40,1),
  ('amd','Ryzen 9 7900X','desktop',12,24,4.70,5.60,1),
  ('amd','Ryzen 9 7950X','desktop',16,32,4.50,5.70,1),

  ('amd','Ryzen 5 8600G','desktop',6,12,4.30,5.00,1),
  ('amd','Ryzen 7 8700G','desktop',8,16,4.20,5.10,1),

  -- Apple: GHz no estándar -> NULL
  ('apple','M1','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M1 Pro','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M1 Max','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M2','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M2 Pro','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M2 Max','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M3','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M3 Pro','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M3 Max','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M4','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M4 Pro','soc',NULL,NULL,NULL,NULL,1),
  ('apple','M4 Max','soc',NULL,NULL,NULL,NULL,1)
) AS cpu_data(vendor_code, model, segment_code, cores, threads, base_ghz, boost_ghz, created_by)
CROSS JOIN asset_cpu_vendors v
CROSS JOIN asset_cpu_segments s
WHERE v.code = cpu_data.vendor_code
  AND s.code = cpu_data.segment_code
ON CONFLICT (vendor_id, model) DO NOTHING;

-- =========================================
-- SEEDS RAM (realista 2019 -> hoy)
-- =========================================
INSERT INTO asset_ram_options (capacity_gb, mem_type_id, speed_mts, form_factor_id, created_by)
SELECT ram_data.capacity_gb, mt.id, ram_data.speed_mts, ff.id, ram_data.created_by
FROM (VALUES
  (8,  'ddr3', 1600, 'dimm',1),
  (16, 'ddr3', 1600, 'dimm',1),

  (4,  'ddr4', 2400, 'sodimm',1),
  (8,  'ddr4', 2400, 'sodimm',1),
  (8,  'ddr4', 2666, 'sodimm',1),
  (16, 'ddr4', 2666, 'sodimm',1),
  (8,  'ddr4', 3200, 'sodimm',1),
  (16, 'ddr4', 3200, 'sodimm',1),
  (32, 'ddr4', 3200, 'sodimm',1),

  (16, 'ddr4', 2400, 'dimm',1),
  (8,  'ddr4', 2666, 'dimm',1),
  (16, 'ddr4', 2666, 'dimm',1),
  (16, 'ddr4', 3200, 'dimm',1),
  (32, 'ddr4', 3200, 'dimm',1),
  (64, 'ddr4', 3200, 'dimm',1),

  (8,  'ddr5', 4800, 'sodimm',1),
  (16, 'ddr5', 4800, 'sodimm',1),
  (16, 'ddr5', 5600, 'sodimm',1),
  (32, 'ddr5', 5600, 'sodimm',1),
  (16, 'ddr5', 5600, 'dimm',1),
  (32, 'ddr5', 5600, 'dimm',1),
  (64, 'ddr5', 5600, 'dimm',1),

  (8,  'lpddr4x', 4266, 'onboard',1),
  (16, 'lpddr4x', 4266, 'onboard',1),
  (16, 'lpddr5',  5500, 'onboard',1),
  (32, 'lpddr5',  6400, 'onboard',1),

  (8,  'unified', NULL, 'onboard',1),
  (16, 'unified', NULL, 'onboard',1),
  (24, 'unified', NULL, 'onboard',1),
  (32, 'unified', NULL, 'onboard',1),
  (36, 'unified', NULL, 'onboard',1),
  (64, 'unified', NULL, 'onboard',1)
) AS ram_data(capacity_gb, mem_type_code, speed_mts, form_factor_code, created_by)
CROSS JOIN asset_ram_memory_types mt
CROSS JOIN asset_ram_form_factors ff
WHERE mt.code = ram_data.mem_type_code
  AND ff.code = ram_data.form_factor_code
ON CONFLICT (capacity_gb, mem_type_id, speed_mts, form_factor_id) DO NOTHING;

-- =========================================
-- SEEDS Storage (realista 2019 -> hoy)
-- =========================================
INSERT INTO asset_storage_options (capacity_gb, drive_type_id, interface_id, form_factor_id, created_by)
SELECT st_data.capacity_gb, dt.id, si.id, ff.id, st_data.created_by
FROM (VALUES
  (256,  'ssd', 'nvme', 'm2', 1),
  (512,  'ssd', 'nvme', 'm2', 1),
  (1000, 'ssd', 'nvme', 'm2', 1),
  (2000, 'ssd', 'nvme', 'm2', 1),
  (4000, 'ssd', 'nvme', 'm2', 1),

  (240,  'ssd', 'sata', '2.5',1),
  (250,  'ssd', 'sata', '2.5',1),
  (480,  'ssd', 'sata', '2.5',1),
  (500,  'ssd', 'sata', '2.5',1),
  (1000, 'ssd', 'sata', '2.5',1),
  (2000, 'ssd', 'sata', '2.5',1),

  (1000, 'hdd', 'sata', '3.5',1),
  (2000, 'hdd', 'sata', '3.5',1),
  (4000, 'hdd', 'sata', '3.5',1),
  (6000, 'hdd', 'sata', '3.5',1),
  (8000, 'hdd', 'sata', '3.5',1)
) AS st_data(capacity_gb, drive_type_code, interface_code, form_factor_code, created_by)
CROSS JOIN asset_storage_drive_types dt
CROSS JOIN asset_storage_interfaces si
CROSS JOIN asset_storage_form_factors ff
WHERE dt.code = st_data.drive_type_code
  AND si.code = st_data.interface_code
  AND ff.code = st_data.form_factor_code
ON CONFLICT (capacity_gb, drive_type_id, interface_id, form_factor_id) DO NOTHING;

-- =========================================
-- Compatibilidad de marcas con componentes
-- =========================================

-- Compatibilidad de marcas con vendors de CPU
INSERT INTO asset_brand_cpu_compatibility (brand_id, cpu_vendor_id, created_by)
SELECT b.id, v.id, 1
FROM asset_brands b
CROSS JOIN asset_cpu_vendors v
WHERE b.name = 'Apple' AND v.code = 'apple'
UNION ALL
SELECT b.id, v.id, 1
FROM asset_brands b
CROSS JOIN asset_cpu_vendors v
WHERE b.name IN ('Dell', 'HP', 'HPE', 'Lenovo', 'MSI', 'Apple', 'Genérico', 'PCCom') AND v.code = 'intel'
UNION ALL
SELECT b.id, v.id, 1
FROM asset_brands b
CROSS JOIN asset_cpu_vendors v
WHERE b.name IN ('Dell', 'HP', 'HPE', 'Lenovo', 'MSI', 'Genérico', 'PCCom') AND v.code = 'amd'
UNION ALL
SELECT b.id, v.id, 1
FROM asset_brands b
CROSS JOIN asset_cpu_vendors v
WHERE b.name IN ('Samsung', 'Xiaomi') AND v.code = 'other'
ON CONFLICT (brand_id, cpu_vendor_id) DO NOTHING;

-- Compatibilidad de marcas con tipos de memoria RAM
INSERT INTO asset_brand_ram_compatibility (brand_id, ram_type_id, created_by)
SELECT b.id, rt.id, 1
FROM asset_brands b
CROSS JOIN asset_ram_memory_types rt
WHERE b.name = 'Apple' AND rt.code = 'unified'
UNION ALL
SELECT b.id, rt.id, 1
FROM asset_brands b
CROSS JOIN asset_ram_memory_types rt
WHERE b.name IN ('Dell', 'HP', 'HPE', 'Lenovo', 'MSI') AND rt.code = 'ddr5'
UNION ALL
SELECT b.id, rt.id, 1
FROM asset_brands b
CROSS JOIN asset_ram_memory_types rt
WHERE b.name IN ('Dell', 'HP', 'HPE', 'Lenovo', 'MSI', 'Apple') AND rt.code = 'ddr4'
UNION ALL
SELECT b.id, rt.id, 1
FROM asset_brands b
CROSS JOIN asset_ram_memory_types rt
WHERE b.name IN ('Samsung', 'Xiaomi') AND rt.code = 'lpddr5'
UNION ALL
SELECT b.id, rt.id, 1
FROM asset_brands b
CROSS JOIN asset_ram_memory_types rt
WHERE b.name IN ('Samsung', 'Xiaomi') AND rt.code = 'lpddr4x'
UNION ALL
SELECT b.id, rt.id, 1
FROM asset_brands b
CROSS JOIN asset_ram_memory_types rt
WHERE b.name IN ('Genérico', 'PCCom') AND rt.code IN ('ddr4', 'ddr5', 'ddr3')
ON CONFLICT (brand_id, ram_type_id) DO NOTHING;

-- Compatibilidad de marcas con familias de SO
INSERT INTO asset_brand_os_compatibility (brand_id, os_family_id, created_by)
SELECT b.id, osf.id, 1
FROM asset_brands b, os_families osf
WHERE b.name = 'Apple' AND osf.name IN ('macOS', 'iOS')
UNION ALL
SELECT b.id, osf.id, 1
FROM asset_brands b, os_families osf
WHERE b.name IN ('Samsung', 'Xiaomi') AND osf.name = 'Android'
UNION ALL
SELECT b.id, osf.id, 1
FROM asset_brands b, os_families osf
WHERE b.name IN ('Dell', 'HP', 'HPE', 'Lenovo', 'MSI','Genérico', 'PCCom') AND osf.name IN ('Windows', 'Linux')
ON CONFLICT (brand_id, os_family_id) DO NOTHING;

-- Compatibilidad de tipos de activo con familias de SO
INSERT INTO asset_type_os_compatibility (type_id, os_family_id, created_by)
-- PC, PC portátil, Workstation, Server -> Windows, Linux, macOS
SELECT t.id, osf.id, 1
FROM asset_types t, os_families osf
WHERE t.name IN ('PC', 'PC portátil', 'Workstation', 'Server')
  AND osf.name IN ('Windows', 'Linux', 'macOS')
UNION ALL
-- Mobile phone, Tablet -> iOS, Android
SELECT t.id, osf.id, 1
FROM asset_types t, os_families osf
WHERE t.name IN ('Mobile phone', 'Tablet')
  AND osf.name IN ('iOS', 'Android')
UNION ALL
-- PDA -> Android, Windows (algunos PDAs industriales usan Windows CE/Mobile)
SELECT t.id, osf.id, 1
FROM asset_types t, os_families osf
WHERE t.name = 'PDA'
  AND osf.name IN ('Android', 'Windows')
ON CONFLICT (type_id, os_family_id) DO NOTHING;

-- acceso a ambos sites
INSERT INTO user_sites (user_id, site_id, is_active)
SELECT u.id, s.site_id, TRUE
FROM app_users u
JOIN sites s ON s.code IN ('POT','SCAMP')
WHERE u.email = 'ilopez@parcelontime.es'
ON CONFLICT (user_id, site_id) DO UPDATE
SET is_active = TRUE;

INSERT INTO user_sites (user_id, site_id, is_active)
SELECT u.id, s.site_id, TRUE
FROM app_users u
JOIN sites s ON s.code IN ('POT')
WHERE u.email = 'viewer@parcelontime.es'
ON CONFLICT (user_id, site_id) DO UPDATE
SET is_active = TRUE;

-- rol admin en ambos sites
INSERT INTO user_site_roles (user_id, site_id, role_id)
SELECT u.id, s.site_id, r.id
FROM app_users u
JOIN sites s ON s.code IN ('POT','SCAMP')
JOIN roles r ON r.code = 'admin'
WHERE u.email = 'ilopez@parcelontime.es'
ON CONFLICT (user_id, site_id, role_id) DO NOTHING;

INSERT INTO user_site_roles (user_id, site_id, role_id)
SELECT u.id, s.site_id, r.id
FROM app_users u
JOIN sites s ON s.code IN ('POT')
JOIN roles r ON r.code = 'viewer'
WHERE u.email = 'viewer@parcelontime.es'
ON CONFLICT (user_id, site_id, role_id) DO NOTHING;

-- Employees (debe ir después de sites)
INSERT INTO employees(site_id, first_name, last_name, second_last_name, email, phone, is_active, notes, created_by) VALUES
  ('1', 'Iván', 'López', 'Ávila', 'ilopez@parcelontime.es', '699384031', TRUE, NULL, 1),
  ('2', 'Fredi', 'Núñez', 'Arquer', 'fredy@scamp.es', '649850007', TRUE, NULL, 1),
  ('1', 'Judith', 'Puig', 'Romero', 'jpuig@parcelontime.es', '683434998', TRUE, NULL, 1),
  ('1', 'Julia', 'Rueda', 'Perez', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Yasmina', 'Baguena', 'De Reina', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Itxaso', 'Azkarraga', 'Arroita', 'iazkarraga@parcelontime.es', '608401927', TRUE, NULL, 1),
  ('1', 'Joaquin', 'Carcelen', 'Moreno', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Hortensia', 'Muñoz', 'Perez', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Maria Cinta', 'Ibañez', 'De Leon', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Pilar', 'Rodriguez', 'Rodriguez', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Carol', 'Pous', 'Palmero', 'recepcionpot1@parcelontime.es', '689202736', TRUE, NULL, 1),
  ('1', 'Azucena', 'Anta', 'Rodríguez', 'conta@parcelontime.es', '628355579', TRUE, NULL, 1),
  ('1', 'Alejandra', 'Armero', 'Muñoz', NULL, NULL, FALSE, NULL, 1),
  ('1', 'Noemi', 'Mateo', 'Vila', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Isabel', 'Carod', 'Murillo', 'sad1@parcelontime.es', NULL, TRUE, NULL, 1),
  ('1', 'Monica', 'Fernandez', 'Mari', 'mfernandez@parcelontime.es', '659878933', TRUE, NULL, 1),
  ('1', 'Sonia', 'Baladon', 'Nogales', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Silvia', 'Roca', 'Marquez', NULL, NULL, FALSE, NULL, 1),
  ('1', 'Debora', 'Martinez', 'Sobrero', 'dmartinez@parcelontime.es', '686130015', TRUE, NULL, 1),
  ('1', 'Jessica', 'Boza', 'Rios', 'jboza@parcelontime.es', '646573891', TRUE, NULL, 1),
  ('1', 'Patricia', 'Flores', 'Lora', 'depots@parcelontime.es', NULL, TRUE, NULL, 1),
  ('1', 'Isabel', 'Sole', 'Pons', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Luis', 'Carcelen', 'Lorenzana', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Inmaculada', 'Martinez', 'Baeza', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Mireia', 'Gimenez', 'Exposito', NULL, NULL, FALSE, NULL, 1),
  ('1', 'Alba', 'Pareja', 'Solis', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Marc', 'Isern', 'Serrat', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Dani', 'Bermudez', 'Diaz', 'toreros@parcelontime.es', '690193260', FALSE, NULL, 1),
  ('1', 'Daniel', 'Lopez', 'Ortiz', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Borja', 'Peralta', 'Moreno', 'bperalta@parcelontime.es', '618628278', TRUE, NULL, 1),
  ('1', 'Ademildes', 'Menezes', 'Dos Santos', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Laia', 'Andrade', 'Contel', NULL, NULL, TRUE, NULL, 1),
  ('1', 'David', 'Martinez', 'Gavin', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Katrina', 'Ramirez', 'Centeno', NULL, NULL, FALSE, NULL, 1),
  ('1', 'Eric', 'Cidoncha', 'Mesas', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Ainoa', 'Sanchez', 'Fernandez', 'devoluciones@parcelontime.es', '699863756', TRUE, NULL, 1),
  ('1', 'Yerai', 'Redondo', 'Gomez', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Sandra', 'De Dios', 'Giron', 'backofficeprod@parcelontime.es', NULL, TRUE, NULL, 1),
  ('1', 'Lucia', 'Gomez', 'Caballero', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Jefferson Stiven', 'Suarez', 'Agudelo', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Desiree', 'Gutierrez', 'Maroto', NULL, NULL, TRUE, NULL, 1),
  ('1', 'M Dolores', 'Martin', 'Hidalgo', NULL, NULL, FALSE, NULL, 1),
  ('1', 'Antonia', 'Rodriguez', 'Bellido', NULL, NULL, TRUE, NULL, 1),
  ('1', 'M Teresa', 'Cerezo', 'Sastre', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Maria Dolores', 'Alarcon', 'Linares', 'produccionbox@parcelontime.es', NULL, TRUE, NULL, 1),
  ('1', 'Carlota', 'Angrill', 'Carmona', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Cristina', 'Ruiz', 'Prieto', 'cruiz@parcelontime.es', '638579675', TRUE, NULL, 1),
  ('1', 'Eva', 'Poveda', 'Sanchez', 'epoveda@parcelontime.es', '690853722', TRUE, NULL, 1),
  ('1', 'Carlos', 'Medel', 'Arce', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Monica', 'Murillo', 'Martinez', 'mmurillo@parcelontime.es', '683644035', TRUE, NULL, 1),
  ('1', 'Veronica', 'Saez', 'Puerto', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Gisela', 'Ros', 'Rojas', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Vanessa', 'Serrano', 'Redrado', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Marianne', 'Maubon', NULL, 'mmaubon@parcelontime.es', '676784493', TRUE, NULL, 1),
  ('1', 'Esther', 'Jady', 'Agramonte', NULL, NULL, TRUE, NULL, 1),
  ('1', 'Elena', 'Micu', NULL, NULL, NULL, TRUE, NULL, 1),
  ('1', 'Juan José', 'Martinez', 'Españó', 'jjmartinez@scamp.es', '696924703', TRUE, NULL, 1),
  ('2', 'Joan', 'Ferrer', 'Cuevas', 'joan@scamp.es', '649850012', TRUE, NULL, 1),
  ('2', 'Jesus', 'Ruiz', 'Garcia', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Yveth Jaqueline', 'Justiniano', 'Carreño', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Marta', 'Belmonte', 'Lafuente', 'marta@scamp.es', '630215707', TRUE, NULL, 1),
  ('2', 'Maria Del Carmen', 'Castejon', 'Bouzada', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Mari Angeles', 'Carnicer', 'Espada', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Micaela', 'Peñas', 'Fernandez', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Anna Maria', 'Amat', 'Alsina', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Juliana', 'Alcazar', 'Sainz', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Elena', 'Delgado', 'Ramos', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Sandra', 'Garcia', 'Doix', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Jose Luis', 'Alonso', 'Garcia', 'departamento.informatica2@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Vanesa', 'Santaella', 'Garcia', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Aleix', 'Ferrer', 'Glaria', 'aferrer@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Mari Carmen', 'Granados', 'Pareja', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Miriam', 'Ruz', 'Garcia', 'resp.prod@scamp.es', '618912945', TRUE, NULL, 1),
  ('2', 'Jordi', 'Carrillo', 'Contreras', 'jcarrillo@scamp.es', '679222118', TRUE, NULL, 1),
  ('2', 'Daniel', 'Pelaez', 'Gallardo', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Irene', 'Jumillas', 'Aranda', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Domingo', 'Lopez', 'Parra', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Miriam', 'Vidal', 'Gimenez', 'departamento.contabilidad@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Yolanda', 'Frias', 'Carrillo', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Gaspar', 'Morales', 'Leon', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Sergio', 'Gutierrez', 'Sanchez', 'sgutierrez@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Cristina', 'Garcia', 'Meca', 'ofiprod02@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Karen', 'Cascallana', 'Bermejo', 'kcascallana@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Ismael', 'Hermoso', 'Rivas', 'departamento.informatica@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Andres', 'Moreno', 'Gilber', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Beatriz', 'Ponce', 'Herrera', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Aurora', 'Belencoso', 'Recuenco', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Maria Carmen', 'Gonzalez', 'Minguez', NULL, NULL, TRUE, NULL, 1),
  ('2', 'M. Àngels', 'Serrano', 'Lamiel', 'aserrano@scamp.es', '681160904', TRUE, NULL, 1),
  ('2', 'Maria Luz', 'Rivas', 'Agudo', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Remedios', 'Lorenzana', 'Gomez', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Miguel Angel', 'Ibarzo', 'Martin', NULL, NULL, FALSE, NULL, 1),
  ('2', 'Montserrat Esther', 'Garrido', 'Gonzalez', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Mari Carmen', 'Juez', 'Diaz', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Jordi', 'Llambrich', 'Brull', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Esther', 'Garcia', 'Cano', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Juan Carlos', 'Mata', 'Rueda', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Rosa', 'Gil', 'Andreu', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Victoria', 'Benedicto', 'Gambin', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Genis', 'Millan', 'Casany', 'gmillan@scamp.es', '681008212', TRUE, NULL, 1),
  ('2', 'Merce', 'Arans', 'Zanon', 'marans@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Consuelo', 'Urbano', 'Jimenez', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Luis', 'Miguel', 'Clopers', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Victoria Eugenia', 'Guerra', 'Duran', 'vguerra@scamp.es', NULL, TRUE, NULL, 1),
  ('2', 'Serge Maurice', 'Pontais', NULL, 'spontais@scamp.es', '639779902', TRUE, NULL, 1),
  ('2', 'Julieth', 'Marulanda', 'Gomez', NULL, NULL, TRUE, NULL, 1),
  ('2', 'Abdul', 'Jabbar', NULL, NULL, NULL, TRUE, NULL, 1),
  ('2', 'Blanca Maria', 'Cubilla', 'Enciso', NULL, NULL, TRUE, NULL, 1);
-- Assets existentes: usar status_id (2 = 'assigned')
-- INSERT INTO assets(site_id, asset_tag, employee_id, type_id, section_id, model_id, os_version_id, cpu_id, ram_id, storage_id, serial, imei, mac_address, ip_address, uuid, status_id, purchase_date, warranty_end, location, notes, retired_at, retired_reason, created_by, created_at, updated_at) VALUES
--  ('1', 'ParcelPC001', '12', '1', '1', '3', '3', '38', '17', '2', 'GM10LJAN', NULL, NULL, NULL, NULL, (SELECT id FROM asset_statuses WHERE code = 'assigned'), NULL, NULL, NULL, NULL, NULL, NULL, '1', '1', '2025-12-30 16:44:20.462588+00', '2025-12-30 16:48:11.075247+00'),
--  ('1', 'MacBook Pro de Iván', '1', '2', '11', '1', '10', '79', '28', '3', 'GXH94DLQK0', NULL, '60:3e:5f:68:d3:22', '192.168.71.51', NULL, (SELECT id FROM asset_statuses WHERE code = 'assigned'), '2023-12-22', '2026-12-22', 'Oficina', 'La dirección MAC e IP es del WiFi. La IP del dock es: 192.168.70.100', NULL, NULL, '1', '1', '2025-12-24 07:23:28.910147+00', '2025-12-30 16:48:28.809154+00'),
--  ('2', 'Mac mini de Fredi', '2', '1', '14', '2', NULL, '74', '25', '1', 'MVD2H27VNX', NULL, NULL, '192.168.1.22', NULL, (SELECT id FROM asset_statuses WHERE code = 'assigned'), '2024-08-09', '2027-08-09', 'Despacho Fredi', NULL, NULL, NULL, '1', '1', '2025-12-24 07:37:44.366854+00', '2025-12-30 16:48:47.132759+00'),
--  ('2', 'MacBook Pro de Fredi', '2', '2', '14', '4', NULL, '6', '4', '1', 'C02D5EQ5MD6M', NULL, NULL, '192.168.1.95', NULL, (SELECT id FROM asset_statuses WHERE code = 'assigned'), '2020-09-09', '2022-09-09', 'Despacho Fredi', NULL, NULL, NULL, '1', '1', '2026-01-07 07:37:44.366854+00', '2026-01-07 16:48:47.132759+00');

-- =========================================
-- Datos ficticios para ver mantenimiento en el front
-- =========================================
INSERT INTO assets (
  site_id,
  asset_tag,
  type_id,
  section_id,
  status_id,
  serial,
  purchase_date,
  warranty_end,
  location,
  notes,
  created_by,
  updated_by
)
VALUES
(
  (SELECT site_id FROM sites WHERE code = 'POT'),
  'PRN-POT-001',
  (SELECT id FROM asset_types WHERE name = 'Printer A4'),
  (SELECT id FROM sections WHERE site_id = (SELECT site_id FROM sites WHERE code = 'POT') AND name = 'Oficina'),
  (SELECT id FROM asset_statuses WHERE code = 'in_stock'),
  'PRN-A4-001',
  '2024-10-10',
  '2027-10-10',
  'Oficina',
  'Impresora A4 principal',
  1,
  1
),
(
  (SELECT site_id FROM sites WHERE code = 'POT'),
  'PRN-POT-002',
  (SELECT id FROM asset_types WHERE name = 'Printer A6'),
  (SELECT id FROM sections WHERE site_id = (SELECT site_id FROM sites WHERE code = 'POT') AND name = 'Packing'),
  (SELECT id FROM asset_statuses WHERE code = 'in_stock'),
  'PRN-A6-002',
  '2025-03-05',
  '2028-03-05',
  'Packing',
  'Impresora etiquetas A6',
  1,
  1
),
(
  (SELECT site_id FROM sites WHERE code = 'SCAMP'),
  'PRN-SCAMP-001',
  (SELECT id FROM asset_types WHERE name = 'Printer A4'),
  (SELECT id FROM sections WHERE site_id = (SELECT site_id FROM sites WHERE code = 'SCAMP') AND name = 'Oficina'),
  (SELECT id FROM asset_statuses WHERE code = 'in_stock'),
  'PRN-SC-A4-001',
  '2024-08-18',
  '2027-08-18',
  'Oficina',
  'Impresora oficina SCAMP',
  1,
  1
)
ON CONFLICT (site_id, asset_tag) DO UPDATE
SET type_id = EXCLUDED.type_id,
    section_id = EXCLUDED.section_id,
    status_id = EXCLUDED.status_id,
    serial = EXCLUDED.serial,
    purchase_date = EXCLUDED.purchase_date,
    warranty_end = EXCLUDED.warranty_end,
    location = EXCLUDED.location,
    notes = EXCLUDED.notes,
    updated_by = EXCLUDED.updated_by,
    updated_at = now();

INSERT INTO asset_maintenance_plans (
  site_id,
  asset_id,
  title,
  maintenance_type,
  priority,
  description,
  is_recurring,
  frequency_days,
  next_due_date,
  last_done_at,
  is_active,
  created_by,
  updated_by
)
SELECT
  (SELECT site_id FROM sites WHERE code = 'POT'),
  (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-001' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT')),
  'Limpieza y revisión general',
  'printer_cleaning',
  'alta',
  'Limpieza de cabezal y rodillos, revisión de bandejas',
  TRUE,
  30,
  '2026-02-20',
  '2026-01-21 09:00:00+00',
  TRUE,
  1,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM asset_maintenance_plans p
  WHERE p.asset_id = (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-001' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT'))
    AND p.title = 'Limpieza y revisión general'
);

INSERT INTO asset_maintenance_plans (
  site_id,
  asset_id,
  title,
  maintenance_type,
  priority,
  description,
  is_recurring,
  frequency_days,
  next_due_date,
  last_done_at,
  is_active,
  created_by,
  updated_by
)
SELECT
  (SELECT site_id FROM sites WHERE code = 'POT'),
  (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-002' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT')),
  'Limpieza de cabezal',
  'printer_cleaning',
  'critica',
  'Limpieza de cabezal y calibración de etiquetas',
  TRUE,
  15,
  '2026-02-12',
  '2026-01-28 10:30:00+00',
  TRUE,
  1,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM asset_maintenance_plans p
  WHERE p.asset_id = (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-002' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT'))
    AND p.title = 'Limpieza de cabezal'
);

INSERT INTO asset_maintenance_plans (
  site_id,
  asset_id,
  title,
  maintenance_type,
  priority,
  description,
  is_recurring,
  frequency_days,
  next_due_date,
  last_done_at,
  is_active,
  created_by,
  updated_by
)
SELECT
  (SELECT site_id FROM sites WHERE code = 'SCAMP'),
  (SELECT id FROM assets WHERE asset_tag = 'PRN-SCAMP-001' AND site_id = (SELECT site_id FROM sites WHERE code = 'SCAMP')),
  'Revisión de rodillos',
  'printer_check',
  'media',
  'Revisión del platen roller y limpieza de sensores',
  TRUE,
  45,
  '2026-03-10',
  '2026-01-24 08:15:00+00',
  TRUE,
  1,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM asset_maintenance_plans p
  WHERE p.asset_id = (SELECT id FROM assets WHERE asset_tag = 'PRN-SCAMP-001' AND site_id = (SELECT site_id FROM sites WHERE code = 'SCAMP'))
    AND p.title = 'Revisión de rodillos'
);

INSERT INTO asset_maintenance_records (
  plan_id,
  site_id,
  asset_id,
  performed_at,
  scheduled_date,
  status,
  notes,
  incidents,
  created_by
)
SELECT
  (SELECT id FROM asset_maintenance_plans WHERE title = 'Limpieza y revisión general'
    AND asset_id = (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-001' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT'))),
  (SELECT site_id FROM sites WHERE code = 'POT'),
  (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-001' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT')),
  '2026-01-21 09:00:00+00',
  '2026-01-21',
  'completed',
  'Limpieza completa y prueba OK',
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM asset_maintenance_records r
  WHERE r.plan_id = (SELECT id FROM asset_maintenance_plans WHERE title = 'Limpieza y revisión general'
    AND asset_id = (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-001' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT')))
);

INSERT INTO asset_maintenance_records (
  plan_id,
  site_id,
  asset_id,
  performed_at,
  scheduled_date,
  status,
  notes,
  incidents,
  created_by
)
SELECT
  (SELECT id FROM asset_maintenance_plans WHERE title = 'Limpieza de cabezal'
    AND asset_id = (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-002' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT'))),
  (SELECT site_id FROM sites WHERE code = 'POT'),
  (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-002' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT')),
  '2026-01-28 10:30:00+00',
  '2026-01-28',
  'completed',
  'Calibración ok',
  'Se detectó leve desgaste en rodillos, programar revisión',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM asset_maintenance_records r
  WHERE r.plan_id = (SELECT id FROM asset_maintenance_plans WHERE title = 'Limpieza de cabezal'
    AND asset_id = (SELECT id FROM assets WHERE asset_tag = 'PRN-POT-002' AND site_id = (SELECT site_id FROM sites WHERE code = 'POT')))
);