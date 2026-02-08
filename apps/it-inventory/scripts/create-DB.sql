-- =========================================
-- IT Inventory DB - MULTI-SITE (site_id)
-- RESET total (sin borrar la DB), usando DROP IF EXISTS
-- IDs: BIGINT en toda la DB
-- Incluye: user_sites + user_site_roles + validaciones de acceso por site
-- + Catálogos: CPU / RAM / Storage (globales)
-- NOTA: sites PK = sites.site_id (todas las FKs apuntan a site_id)
-- =========================================

CREATE EXTENSION IF NOT EXISTS citext;

-- =========================================
-- DROP TRIGGERS + FUNCTIONS
-- =========================================
DROP TRIGGER IF EXISTS trg_assignments_creator_has_site_access ON asset_assignments;
DROP TRIGGER IF EXISTS trg_assets_audit_user_has_site_access ON assets;
DROP TRIGGER IF EXISTS trg_assignments_same_site ON asset_assignments;
DROP TRIGGER IF EXISTS trg_assets_section_same_site ON assets;
DROP TRIGGER IF EXISTS trg_assets_employee_same_site ON assets;
DROP TRIGGER IF EXISTS trg_assets_os_support ON assets;
DROP TRIGGER IF EXISTS trg_assets_model_type ON assets;

DROP TRIGGER IF EXISTS trg_assets_updated_at ON assets;
DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS trg_storage_options_updated_at ON asset_storage_options;
DROP TRIGGER IF EXISTS trg_ram_options_updated_at ON asset_ram_options;
DROP TRIGGER IF EXISTS trg_cpus_updated_at ON asset_cpus;
DROP TRIGGER IF EXISTS trg_asset_models_updated_at ON asset_models;
DROP TRIGGER IF EXISTS trg_asset_brands_updated_at ON asset_brands;
DROP TRIGGER IF EXISTS trg_os_versions_updated_at ON os_versions;
DROP TRIGGER IF EXISTS trg_os_families_updated_at ON os_families;
DROP TRIGGER IF EXISTS trg_sections_updated_at ON sections;
DROP TRIGGER IF EXISTS trg_asset_statuses_updated_at ON asset_statuses;
DROP TRIGGER IF EXISTS trg_asset_types_updated_at ON asset_types;
DROP TRIGGER IF EXISTS trg_asset_maintenance_types_updated_at ON asset_maintenance_types;
DROP TRIGGER IF EXISTS trg_holidays_updated_at ON holidays;
DROP TRIGGER IF EXISTS trg_permissions_updated_at ON permissions;
DROP TRIGGER IF EXISTS trg_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS trg_sites_updated_at ON sites;
DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;

DROP FUNCTION IF EXISTS enforce_assignments_creator_has_site_access() CASCADE;
DROP FUNCTION IF EXISTS enforce_assets_audit_user_has_site_access() CASCADE;
DROP FUNCTION IF EXISTS enforce_assignment_same_site() CASCADE;
DROP FUNCTION IF EXISTS enforce_asset_section_same_site() CASCADE;
DROP FUNCTION IF EXISTS enforce_asset_employee_same_site() CASCADE;
DROP FUNCTION IF EXISTS enforce_asset_os_support() CASCADE;
DROP FUNCTION IF EXISTS enforce_asset_model_type() CASCADE;
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

-- =========================================
-- DROP TABLES (orden dependencias)
-- =========================================
DROP TABLE IF EXISTS asset_maintenance_records CASCADE;
DROP TABLE IF EXISTS asset_maintenance_plans CASCADE;
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

DROP TABLE IF EXISTS asset_models CASCADE;
DROP TABLE IF EXISTS asset_brands CASCADE;

-- NUEVO: catálogos HW (se dropean después de assets)
DROP TABLE IF EXISTS asset_storage_options CASCADE;
DROP TABLE IF EXISTS asset_ram_options CASCADE;
DROP TABLE IF EXISTS asset_cpus CASCADE;

-- Catálogos de opciones de hardware
DROP TABLE IF EXISTS asset_storage_form_factors CASCADE;
DROP TABLE IF EXISTS asset_storage_interfaces CASCADE;
DROP TABLE IF EXISTS asset_storage_drive_types CASCADE;
DROP TABLE IF EXISTS asset_ram_form_factors CASCADE;
DROP TABLE IF EXISTS asset_ram_memory_types CASCADE;
DROP TABLE IF EXISTS asset_cpu_segments CASCADE;
DROP TABLE IF EXISTS asset_cpu_vendors CASCADE;

DROP TABLE IF EXISTS asset_brand_os_compatibility CASCADE;
DROP TABLE IF EXISTS asset_brand_ram_compatibility CASCADE;
DROP TABLE IF EXISTS asset_brand_cpu_compatibility CASCADE;
DROP TABLE IF EXISTS asset_type_os_compatibility CASCADE;

DROP TABLE IF EXISTS os_versions CASCADE;
DROP TABLE IF EXISTS os_families CASCADE;

DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS asset_types CASCADE;
DROP TABLE IF EXISTS asset_statuses CASCADE;
DROP TABLE IF EXISTS asset_maintenance_types CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;

DROP TABLE IF EXISTS user_site_roles CASCADE;
DROP TABLE IF EXISTS user_sites CASCADE;

DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS sites CASCADE;


-- =========================================
-- login_attempts (rate limiting)
-- =========================================
CREATE TABLE login_attempts (
  ip            VARCHAR(45) PRIMARY KEY,
  count         INT NOT NULL DEFAULT 0,
  last_attempt  TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NULL
);

CREATE INDEX idx_login_attempts_blocked ON login_attempts(blocked_until) WHERE blocked_until IS NOT NULL;
CREATE INDEX idx_login_attempts_last ON login_attempts(last_attempt);

-- =========================================
-- app_users
-- =========================================
CREATE TABLE app_users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_name     TEXT NULL,
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  language      TEXT NOT NULL DEFAULT 'es',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    BIGINT NULL REFERENCES app_users(id),
  updated_by    BIGINT NULL REFERENCES app_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NULL
);

CREATE INDEX idx_app_users_active ON app_users(is_active);
CREATE INDEX idx_app_users_created_by ON app_users(created_by);
CREATE INDEX idx_app_users_updated_by ON app_users(updated_by);

-- =========================================
-- refresh_tokens (JWT refresh tokens)
-- =========================================
CREATE TABLE refresh_tokens (
  token       TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address  TEXT NULL,
  user_agent  TEXT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(is_revoked) WHERE is_revoked = FALSE;

-- =========================================
-- sites (tenant: empresa/sede)
-- =========================================
CREATE TABLE sites (
  site_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_sites_active ON sites(is_active);

-- user_sites: acceso a 1..N sites
CREATE TABLE user_sites (
  user_id   BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  site_id   BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (user_id, site_id)
);

CREATE INDEX idx_user_sites_site_id ON user_sites(site_id);
CREATE INDEX idx_user_sites_active ON user_sites(user_id, is_active);

-- =========================================
-- RBAC global + roles por site
-- =========================================

CREATE TABLE roles (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_roles_active ON roles(is_active);


CREATE TABLE permissions (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_permissions_active ON permissions(is_active);

CREATE TABLE role_permissions (
  role_id        BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id  BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- user_site_roles: roles distintos por site
CREATE TABLE user_site_roles (
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  site_id BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  PRIMARY KEY (user_id, site_id, role_id)
);

CREATE INDEX idx_user_site_roles_site ON user_site_roles(site_id);
CREATE INDEX idx_user_site_roles_role ON user_site_roles(role_id);

-- =========================================
-- Catálogo global: asset_types
-- =========================================

CREATE TABLE asset_types (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  sort_order    INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_assignable BOOLEAN NOT NULL DEFAULT FALSE,
  supports_os   BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_types_active_sort ON asset_types(is_active, sort_order);

-- =========================================
-- Catálogo global: asset_statuses
-- =========================================

CREATE TABLE asset_statuses (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  color_class TEXT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_statuses_active_sort ON asset_statuses(is_active, sort_order);

-- =========================================
-- Catalogo global: asset_maintenance_types
-- =========================================

CREATE TABLE asset_maintenance_types (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_maintenance_types_active_sort ON asset_maintenance_types(is_active, sort_order);

-- =========================================
-- Catalogo global: holidays
-- =========================================

CREATE TABLE holidays (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date        DATE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,
  CONSTRAINT ux_holidays_date_name UNIQUE (date, name)
);

CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_holidays_active ON holidays(is_active);

-- =========================================
-- sections POR SITE
-- =========================================

CREATE TABLE sections (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id    BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,
  CONSTRAINT ux_sections_site_name UNIQUE (site_id, name)
);

CREATE INDEX idx_sections_site_active ON sections(site_id, is_active);

-- =========================================
-- Catálogo global: os_families / os_versions
-- =========================================

CREATE TABLE os_families (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_os_families_active ON os_families(is_active);


CREATE TABLE os_versions (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  os_family_id BIGINT NOT NULL REFERENCES os_families(id) ON DELETE RESTRICT,
  name         TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,
  CONSTRAINT ux_os_versions UNIQUE (os_family_id, name)
);

CREATE INDEX idx_os_versions_family_active ON os_versions(os_family_id, is_active);

-- =========================================
-- Catálogo global: asset_brands + asset_models
-- =========================================

CREATE TABLE asset_brands (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_brands_active ON asset_brands(is_active);


CREATE TABLE asset_models (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type_id   BIGINT NOT NULL REFERENCES asset_types(id) ON DELETE RESTRICT,
  brand_id  BIGINT NOT NULL REFERENCES asset_brands(id) ON DELETE RESTRICT,
  model     TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,
  CONSTRAINT ux_asset_models UNIQUE (type_id, brand_id, model)
);

CREATE INDEX idx_asset_models_type_active ON asset_models(type_id, is_active);
CREATE INDEX idx_asset_models_brand_active ON asset_models(brand_id, is_active);

-- =========================================
-- Catálogos de opciones para hardware
-- =========================================

-- CPU Vendors
CREATE TABLE asset_cpu_vendors (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES app_users(id),
  updated_by BIGINT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_cpu_vendors_active ON asset_cpu_vendors(is_active);

-- CPU Segments
CREATE TABLE asset_cpu_segments (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES app_users(id),
  updated_by BIGINT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_cpu_segments_active ON asset_cpu_segments(is_active);

-- RAM Memory Types
CREATE TABLE asset_ram_memory_types (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES app_users(id),
  updated_by BIGINT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_ram_memory_types_active ON asset_ram_memory_types(is_active);

-- RAM Form Factors
CREATE TABLE asset_ram_form_factors (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES app_users(id),
  updated_by BIGINT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_ram_form_factors_active ON asset_ram_form_factors(is_active);

-- Storage Drive Types
CREATE TABLE asset_storage_drive_types (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES app_users(id),
  updated_by BIGINT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_storage_drive_types_active ON asset_storage_drive_types(is_active);

-- Storage Interfaces
CREATE TABLE asset_storage_interfaces (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES app_users(id),
  updated_by BIGINT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_storage_interfaces_active ON asset_storage_interfaces(is_active);

-- Storage Form Factors
CREATE TABLE asset_storage_form_factors (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES app_users(id),
  updated_by BIGINT NULL REFERENCES app_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_storage_form_factors_active ON asset_storage_form_factors(is_active);

-- =========================================
-- Catálogo global CPUs (con velocidades)
-- =========================================

CREATE TABLE asset_cpus (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vendor_id  BIGINT NOT NULL REFERENCES asset_cpu_vendors(id) ON DELETE RESTRICT,
  model      TEXT NOT NULL,   -- "Core i5-10400", "Ryzen 5 5600X", "M2"
  segment_id BIGINT NULL REFERENCES asset_cpu_segments(id) ON DELETE RESTRICT,

  cores     INT NULL CHECK (cores IS NULL OR cores > 0),
  threads   INT NULL CHECK (threads IS NULL OR threads > 0),
  base_ghz  NUMERIC(4,2) NULL CHECK (base_ghz IS NULL OR base_ghz > 0),
  boost_ghz NUMERIC(4,2) NULL CHECK (boost_ghz IS NULL OR boost_ghz > 0),

  notes     TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,
  CONSTRAINT ux_asset_cpus UNIQUE (vendor_id, model)
);

CREATE INDEX idx_asset_cpus_vendor_active ON asset_cpus(vendor_id, is_active);
CREATE INDEX idx_asset_cpus_segment ON asset_cpus(segment_id) WHERE segment_id IS NOT NULL;

-- =========================================
-- Catálogo global RAM (desde 2019 -> hoy)
-- =========================================

CREATE TABLE asset_ram_options (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  capacity_gb     INT  NOT NULL CHECK (capacity_gb > 0),
  mem_type_id     BIGINT NOT NULL REFERENCES asset_ram_memory_types(id) ON DELETE RESTRICT,
  speed_mts       INT  NULL CHECK (speed_mts IS NULL OR speed_mts > 0),
  form_factor_id  BIGINT NULL REFERENCES asset_ram_form_factors(id) ON DELETE RESTRICT,
  notes           TEXT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,
  CONSTRAINT ux_asset_ram UNIQUE (capacity_gb, mem_type_id, speed_mts, form_factor_id)
);

CREATE INDEX idx_asset_ram_active ON asset_ram_options(is_active);
CREATE INDEX idx_asset_ram_type ON asset_ram_options(mem_type_id);
CREATE INDEX idx_asset_ram_form_factor ON asset_ram_options(form_factor_id) WHERE form_factor_id IS NOT NULL;

-- =========================================
-- Catálogo global Storage (desde 2019 -> hoy)
-- =========================================

CREATE TABLE asset_storage_options (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  capacity_gb     INT  NOT NULL CHECK (capacity_gb > 0),
  drive_type_id   BIGINT NOT NULL REFERENCES asset_storage_drive_types(id) ON DELETE RESTRICT,
  interface_id    BIGINT NULL REFERENCES asset_storage_interfaces(id) ON DELETE RESTRICT,
  form_factor_id  BIGINT NULL REFERENCES asset_storage_form_factors(id) ON DELETE RESTRICT,
  notes           TEXT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,
  CONSTRAINT ux_asset_storage UNIQUE (capacity_gb, drive_type_id, interface_id, form_factor_id)
);

CREATE INDEX idx_asset_storage_active ON asset_storage_options(is_active);
CREATE INDEX idx_asset_storage_drive_type ON asset_storage_options(drive_type_id);
CREATE INDEX idx_asset_storage_interface ON asset_storage_options(interface_id) WHERE interface_id IS NOT NULL;
CREATE INDEX idx_asset_storage_form_factor ON asset_storage_options(form_factor_id) WHERE form_factor_id IS NOT NULL;

-- =========================================
-- Tablas de compatibilidad entre marcas y componentes
-- =========================================

-- Compatibilidad de marcas con fabricantes de CPU
CREATE TABLE asset_brand_cpu_compatibility (
  brand_id      BIGINT NOT NULL REFERENCES asset_brands(id) ON DELETE CASCADE,
  cpu_vendor_id BIGINT NOT NULL REFERENCES asset_cpu_vendors(id) ON DELETE CASCADE,
  created_by    BIGINT NULL REFERENCES app_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (brand_id, cpu_vendor_id)
);

-- Compatibilidad de marcas con tipos de memoria RAM
CREATE TABLE asset_brand_ram_compatibility (
  brand_id    BIGINT NOT NULL REFERENCES asset_brands(id) ON DELETE CASCADE,
  ram_type_id BIGINT NOT NULL REFERENCES asset_ram_memory_types(id) ON DELETE CASCADE,
  created_by  BIGINT NULL REFERENCES app_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (brand_id, ram_type_id)
);

-- Compatibilidad de marcas con familias de SO
CREATE TABLE asset_brand_os_compatibility (
  brand_id     BIGINT NOT NULL REFERENCES asset_brands(id) ON DELETE CASCADE,
  os_family_id BIGINT NOT NULL REFERENCES os_families(id) ON DELETE CASCADE,
  created_by   BIGINT NULL REFERENCES app_users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (brand_id, os_family_id)
);

-- Compatibilidad de tipos de activo con familias de SO
CREATE TABLE asset_type_os_compatibility (
  type_id      BIGINT NOT NULL REFERENCES asset_types(id) ON DELETE CASCADE,
  os_family_id BIGINT NOT NULL REFERENCES os_families(id) ON DELETE CASCADE,
  created_by   BIGINT NULL REFERENCES app_users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (type_id, os_family_id)
);

-- Índices para las tablas de compatibilidad
CREATE INDEX idx_asset_brand_cpu_compat ON asset_brand_cpu_compatibility(brand_id);
CREATE INDEX idx_asset_brand_cpu_compat_vendor ON asset_brand_cpu_compatibility(cpu_vendor_id);
CREATE INDEX idx_asset_brand_ram_compat ON asset_brand_ram_compatibility(brand_id);
CREATE INDEX idx_asset_brand_ram_compat_type ON asset_brand_ram_compatibility(ram_type_id);
CREATE INDEX idx_asset_brand_os_compat ON asset_brand_os_compatibility(brand_id);
CREATE INDEX idx_asset_brand_os_compat_family ON asset_brand_os_compatibility(os_family_id);
CREATE INDEX idx_asset_type_os_compat ON asset_type_os_compatibility(type_id);
CREATE INDEX idx_asset_type_os_compat_family ON asset_type_os_compatibility(os_family_id);

-- =========================================
-- employees POR SITE
-- =========================================
CREATE TABLE employees (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id           BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  second_last_name  TEXT NULL,
  email             CITEXT NULL,
  phone             TEXT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  notes             TEXT NULL,
  created_by        BIGINT NULL REFERENCES app_users(id),
  updated_by        BIGINT NULL REFERENCES app_users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NULL,
  CONSTRAINT ux_employees_site_email UNIQUE (site_id, email),
  CONSTRAINT ux_employees_site_fullname UNIQUE (site_id, first_name, last_name, second_last_name)
);

CREATE INDEX idx_employees_site_active ON employees(site_id, is_active);
CREATE INDEX idx_employees_email ON employees(email) WHERE email IS NOT NULL;

-- =========================================
-- assets POR SITE
-- =========================================
CREATE TABLE assets (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id         BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,

  asset_tag       TEXT NOT NULL,
  employee_id     BIGINT NULL REFERENCES employees(id) ON DELETE SET NULL,
  type_id         BIGINT NOT NULL REFERENCES asset_types(id),

  section_id      BIGINT NULL REFERENCES sections(id) ON DELETE RESTRICT,
  model_id        BIGINT NULL REFERENCES asset_models(id) ON DELETE RESTRICT,
  os_version_id   BIGINT NULL REFERENCES os_versions(id) ON DELETE RESTRICT,

  -- specs
  cpu_id          BIGINT NULL REFERENCES asset_cpus(id) ON DELETE SET NULL,
  ram_id          BIGINT NULL REFERENCES asset_ram_options(id) ON DELETE SET NULL,
  storage_id      BIGINT NULL REFERENCES asset_storage_options(id) ON DELETE SET NULL,

  serial          TEXT NULL,
  imei            TEXT NULL,
  mac_address     TEXT NULL,
  ip_address      TEXT NULL,
  uuid            TEXT NULL,

  status_id       BIGINT NULL REFERENCES asset_statuses(id) ON DELETE RESTRICT,

  purchase_date   DATE NULL,
  warranty_end    DATE NULL,

  location        TEXT NULL,
  notes           TEXT NULL,

  retired_at      TIMESTAMPTZ NULL,
  retired_reason  TEXT NULL,

  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL,

  CONSTRAINT ux_assets_site_tag UNIQUE (site_id, asset_tag),
  CONSTRAINT ux_assets_site_serial UNIQUE (site_id, serial),
  CONSTRAINT ux_assets_site_imei UNIQUE (site_id, imei)
);

CREATE INDEX idx_assets_site ON assets(site_id);
CREATE INDEX idx_assets_site_type_status ON assets(site_id, type_id, status_id);
CREATE INDEX idx_assets_site_section ON assets(site_id, section_id);
CREATE INDEX idx_assets_employee ON assets(employee_id);

CREATE INDEX idx_assets_cpu ON assets(cpu_id) WHERE cpu_id IS NOT NULL;
CREATE INDEX idx_assets_ram ON assets(ram_id) WHERE ram_id IS NOT NULL;
CREATE INDEX idx_assets_storage ON assets(storage_id) WHERE storage_id IS NOT NULL;
CREATE INDEX idx_assets_model ON assets(model_id) WHERE model_id IS NOT NULL;
CREATE INDEX idx_assets_os_version ON assets(os_version_id) WHERE os_version_id IS NOT NULL;
CREATE INDEX idx_assets_status ON assets(status_id) WHERE status_id IS NOT NULL;
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assets_serial ON assets(serial) WHERE serial IS NOT NULL;
CREATE INDEX idx_assets_retired ON assets(retired_at) WHERE retired_at IS NOT NULL;
CREATE INDEX idx_assets_site_not_retired ON assets(site_id) WHERE retired_at IS NULL;

-- =========================================
-- asset_maintenance_plans
-- =========================================
CREATE TABLE asset_maintenance_plans (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id         BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
  asset_id        BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  maintenance_type TEXT NULL,
  priority        VARCHAR(20) DEFAULT 'media',
  description     TEXT NULL,
  is_recurring    BOOLEAN NOT NULL DEFAULT TRUE,
  frequency_days  INT NULL CHECK (frequency_days IS NULL OR frequency_days > 0),
  next_due_date   DATE NOT NULL,
  last_done_at    TIMESTAMPTZ NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      BIGINT NULL REFERENCES app_users(id),
  updated_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_asset_maintenance_plans_site ON asset_maintenance_plans(site_id);
CREATE INDEX idx_asset_maintenance_plans_asset ON asset_maintenance_plans(asset_id);
CREATE INDEX idx_asset_maintenance_plans_due ON asset_maintenance_plans(next_due_date);
CREATE INDEX idx_asset_maintenance_plans_active ON asset_maintenance_plans(is_active);

-- =========================================
-- asset_maintenance_records
-- =========================================
CREATE TABLE asset_maintenance_records (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id         BIGINT NOT NULL REFERENCES asset_maintenance_plans(id) ON DELETE CASCADE,
  site_id         BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
  asset_id        BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  performed_at    TIMESTAMPTZ NOT NULL,
  scheduled_date  DATE NULL,
  status          TEXT NOT NULL DEFAULT 'completed',
  notes           TEXT NULL,
  incidents       TEXT NULL,
  created_by      BIGINT NULL REFERENCES app_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_maintenance_records_plan ON asset_maintenance_records(plan_id);
CREATE INDEX idx_asset_maintenance_records_site ON asset_maintenance_records(site_id);
CREATE INDEX idx_asset_maintenance_records_asset ON asset_maintenance_records(asset_id);
CREATE INDEX idx_asset_maintenance_records_performed ON asset_maintenance_records(performed_at);

-- =========================================
-- Validación: model_id pertenece al type_id
-- =========================================
CREATE OR REPLACE FUNCTION enforce_asset_model_type()
RETURNS TRIGGER AS $$
DECLARE v_type_id BIGINT;
BEGIN
  IF NEW.model_id IS NULL THEN RETURN NEW; END IF;

  SELECT type_id INTO v_type_id
  FROM asset_models
  WHERE id = NEW.model_id;

  IF v_type_id IS NULL OR v_type_id <> NEW.type_id THEN
    RAISE EXCEPTION 'model_id % does not belong to type_id %', NEW.model_id, NEW.type_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assets_model_type
BEFORE INSERT OR UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION enforce_asset_model_type();

-- =========================================
-- Validación: os_version_id solo si el tipo soporta SO
-- =========================================
CREATE OR REPLACE FUNCTION enforce_asset_os_support()
RETURNS TRIGGER AS $$
DECLARE v_supports_os BOOLEAN;
BEGIN
  IF NEW.os_version_id IS NULL THEN RETURN NEW; END IF;

  SELECT supports_os INTO v_supports_os
  FROM asset_types
  WHERE id = NEW.type_id;

  IF v_supports_os IS NOT TRUE THEN
    RAISE EXCEPTION 'Asset type % does not support OS', NEW.type_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assets_os_support
BEFORE INSERT OR UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION enforce_asset_os_support();

-- =========================================
-- Validación: section_id debe ser del mismo site
-- =========================================
CREATE OR REPLACE FUNCTION enforce_asset_section_same_site()
RETURNS TRIGGER AS $$
DECLARE s_site BIGINT;
BEGIN
  IF NEW.section_id IS NULL THEN RETURN NEW; END IF;

  SELECT site_id INTO s_site
  FROM sections
  WHERE id = NEW.section_id;

  IF s_site IS NULL OR s_site <> NEW.site_id THEN
    RAISE EXCEPTION 'section_id % does not belong to site_id %', NEW.section_id, NEW.site_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assets_section_same_site
BEFORE INSERT OR UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION enforce_asset_section_same_site();

-- =========================================
-- Validación: employee_id debe ser del mismo site
-- =========================================
CREATE OR REPLACE FUNCTION enforce_asset_employee_same_site()
RETURNS TRIGGER AS $$
DECLARE e_site BIGINT;
BEGIN
  IF NEW.employee_id IS NULL THEN RETURN NEW; END IF;

  SELECT site_id INTO e_site
  FROM employees
  WHERE id = NEW.employee_id;

  IF e_site IS NULL OR e_site <> NEW.site_id THEN
    RAISE EXCEPTION 'employee_id % does not belong to site_id %', NEW.employee_id, NEW.site_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assets_employee_same_site
BEFORE INSERT OR UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION enforce_asset_employee_same_site();

-- =========================================
-- Validación: created_by / updated_by deben tener acceso al site
-- =========================================
CREATE OR REPLACE FUNCTION enforce_assets_audit_user_has_site_access()
RETURNS TRIGGER AS $$
DECLARE ok_created BOOLEAN;
DECLARE ok_updated BOOLEAN;
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM user_sites us
      WHERE us.user_id = NEW.created_by
        AND us.site_id = NEW.site_id
        AND us.is_active = TRUE
    ) INTO ok_created;

    IF ok_created IS NOT TRUE THEN
      RAISE EXCEPTION 'created_by user % has no access to site %', NEW.created_by, NEW.site_id;
    END IF;
  END IF;

  IF NEW.updated_by IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM user_sites us
      WHERE us.user_id = NEW.updated_by
        AND us.site_id = NEW.site_id
        AND us.is_active = TRUE
    ) INTO ok_updated;

    IF ok_updated IS NOT TRUE THEN
      RAISE EXCEPTION 'updated_by user % has no access to site %', NEW.updated_by, NEW.site_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assets_audit_user_has_site_access
BEFORE INSERT OR UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION enforce_assets_audit_user_has_site_access();

-- =========================================
-- asset_assignments POR SITE
-- =========================================
CREATE TABLE asset_assignments (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  site_id     BIGINT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,

  asset_id    BIGINT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id BIGINT NOT NULL REFERENCES employees(id),

  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  returned_at TIMESTAMPTZ NULL,

  comment     TEXT NULL,
  created_by  BIGINT NULL REFERENCES app_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT assignments_return_after_assign CHECK (
    returned_at IS NULL OR returned_at >= assigned_at
  )
);

CREATE UNIQUE INDEX ux_asset_one_active_assignment
ON asset_assignments(asset_id)
WHERE returned_at IS NULL;

CREATE INDEX idx_assignments_site ON asset_assignments(site_id);
CREATE INDEX idx_assignments_employee_active
ON asset_assignments(employee_id)
WHERE returned_at IS NULL;
CREATE INDEX idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_assignments_assigned_at ON asset_assignments(assigned_at);
CREATE INDEX idx_assignments_returned_at ON asset_assignments(returned_at) WHERE returned_at IS NOT NULL;
CREATE INDEX idx_assignments_active ON asset_assignments(site_id, returned_at) WHERE returned_at IS NULL;

-- Validación: asset y employee mismo site + assignment.site_id consistente
CREATE OR REPLACE FUNCTION enforce_assignment_same_site()
RETURNS TRIGGER AS $$
DECLARE a_site BIGINT;
DECLARE e_site BIGINT;
BEGIN
  SELECT site_id INTO a_site FROM assets WHERE id = NEW.asset_id;
  SELECT site_id INTO e_site FROM employees WHERE id = NEW.employee_id;

  IF a_site IS NULL OR e_site IS NULL OR a_site <> e_site THEN
    RAISE EXCEPTION 'Asset and employee must belong to the same site';
  END IF;

  IF NEW.site_id <> a_site THEN
    RAISE EXCEPTION 'assignment.site_id must match asset.site_id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assignments_same_site
BEFORE INSERT OR UPDATE ON asset_assignments
FOR EACH ROW EXECUTE FUNCTION enforce_assignment_same_site();

-- Validación: created_by en asignaciones debe tener acceso al site
CREATE OR REPLACE FUNCTION enforce_assignments_creator_has_site_access()
RETURNS TRIGGER AS $$
DECLARE ok_creator BOOLEAN;
BEGIN
  IF NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM user_sites us
    WHERE us.user_id = NEW.created_by
      AND us.site_id = NEW.site_id
      AND us.is_active = TRUE
  ) INTO ok_creator;

  IF ok_creator IS NOT TRUE THEN
    RAISE EXCEPTION 'created_by user % has no access to site %', NEW.created_by, NEW.site_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assignments_creator_has_site_access
BEFORE INSERT OR UPDATE ON asset_assignments
FOR EACH ROW EXECUTE FUNCTION enforce_assignments_creator_has_site_access();

-- =========================================
-- updated_at triggers
-- =========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_app_users_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sites_updated_at
BEFORE UPDATE ON sites
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_permissions_updated_at
BEFORE UPDATE ON permissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_types_updated_at
BEFORE UPDATE ON asset_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_statuses_updated_at
BEFORE UPDATE ON asset_statuses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_maintenance_types_updated_at
BEFORE UPDATE ON asset_maintenance_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_holidays_updated_at
BEFORE UPDATE ON holidays
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sections_updated_at
BEFORE UPDATE ON sections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_os_families_updated_at
BEFORE UPDATE ON os_families
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_os_versions_updated_at
BEFORE UPDATE ON os_versions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_brands_updated_at
BEFORE UPDATE ON asset_brands
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_models_updated_at
BEFORE UPDATE ON asset_models
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_cpus_updated_at
BEFORE UPDATE ON asset_cpus
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ram_options_updated_at
BEFORE UPDATE ON asset_ram_options
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_storage_options_updated_at
BEFORE UPDATE ON asset_storage_options
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_cpu_vendors_updated_at
BEFORE UPDATE ON asset_cpu_vendors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_cpu_segments_updated_at
BEFORE UPDATE ON asset_cpu_segments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_ram_memory_types_updated_at
BEFORE UPDATE ON asset_ram_memory_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_ram_form_factors_updated_at
BEFORE UPDATE ON asset_ram_form_factors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_storage_drive_types_updated_at
BEFORE UPDATE ON asset_storage_drive_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_storage_interfaces_updated_at
BEFORE UPDATE ON asset_storage_interfaces
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_storage_form_factors_updated_at
BEFORE UPDATE ON asset_storage_form_factors
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
