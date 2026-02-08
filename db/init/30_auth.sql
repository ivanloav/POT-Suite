-- Auth schema (shared login + RBAC)
SET search_path TO auth,public;

-- Clean
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS user_apps CASCADE;
DROP TABLE IF EXISTS apps CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_name     TEXT NULL,
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  language      TEXT NOT NULL DEFAULT 'es',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    BIGINT NULL REFERENCES users(id),
  updated_by    BIGINT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NULL
);

CREATE INDEX idx_auth_users_active ON users(is_active);
CREATE INDEX idx_auth_users_created_by ON users(created_by);
CREATE INDEX idx_auth_users_updated_by ON users(updated_by);

-- Apps
CREATE TABLE apps (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_auth_apps_active ON apps(is_active);

-- User -> Apps
CREATE TABLE user_apps (
  user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id    BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (user_id, app_id)
);

CREATE INDEX idx_auth_user_apps_app ON user_apps(app_id);

-- Roles
CREATE TABLE roles (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  app_id     BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES users(id),
  updated_by BIGINT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL,
  UNIQUE (app_id, code)
);

CREATE INDEX idx_auth_roles_active ON roles(is_active);
CREATE INDEX idx_auth_roles_app ON roles(app_id);

-- Permissions
CREATE TABLE permissions (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  app_id     BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NULL REFERENCES users(id),
  updated_by BIGINT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL,
  UNIQUE (app_id, code)
);

CREATE INDEX idx_auth_permissions_active ON permissions(is_active);
CREATE INDEX idx_auth_permissions_app ON permissions(app_id);

-- Role <-> Permission
CREATE TABLE role_permissions (
  role_id       BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User <-> Role
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- login_attempts (rate limiting)
CREATE TABLE login_attempts (
  ip            VARCHAR(45) PRIMARY KEY,
  count         INT NOT NULL DEFAULT 0,
  last_attempt  TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NULL
);

CREATE INDEX idx_auth_login_attempts_blocked ON login_attempts(blocked_until) WHERE blocked_until IS NOT NULL;
CREATE INDEX idx_auth_login_attempts_last ON login_attempts(last_attempt);

-- Refresh tokens
CREATE TABLE refresh_tokens (
  token       TEXT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  is_revoked  BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address  TEXT NULL,
  user_agent  TEXT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auth_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_auth_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_auth_refresh_tokens_revoked ON refresh_tokens(is_revoked) WHERE is_revoked = FALSE;

-- Seeds: apps + admin user
INSERT INTO apps (code, name)
VALUES
  ('gespack', 'GesPack'),
  ('it', 'IT Inventory')
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (user_name, email, password_hash, is_active)
VALUES ('Ivan', 'ilopez@parcelontime.es', crypt('P@rcel2025', gen_salt('bf')), TRUE)
ON CONFLICT (email) DO NOTHING;

-- Assign admin access to both apps
INSERT INTO user_apps (user_id, app_id)
SELECT u.id, a.id
FROM users u
JOIN apps a ON a.code IN ('gespack','it')
WHERE u.email = 'ilopez@parcelontime.es'
ON CONFLICT DO NOTHING;

-- Admin roles per app
INSERT INTO roles (app_id, code, name, created_by)
SELECT a.id, 'admin', 'Administrador', u.id
FROM apps a
JOIN users u ON u.email = 'ilopez@parcelontime.es'
WHERE a.code IN ('gespack','it')
ON CONFLICT (app_id, code) DO UPDATE
SET name = EXCLUDED.name, is_active = TRUE;

-- IT app roles (extra)
INSERT INTO roles (app_id, code, name, created_by)
SELECT a.id, r.code, r.name, u.id
FROM apps a
JOIN users u ON u.email = 'ilopez@parcelontime.es'
CROSS JOIN (VALUES
  ('it', 'Tecnico IT'),
  ('viewer', 'Solo lectura')
) AS r(code, name)
WHERE a.code = 'it'
ON CONFLICT (app_id, code) DO UPDATE
SET name = EXCLUDED.name, is_active = TRUE;

-- IT app permissions (from it-inventory insert-DB)
INSERT INTO permissions (app_id, code, name, created_by)
SELECT a.id, p.code, p.name, u.id
FROM apps a
JOIN users u ON u.email = 'ilopez@parcelontime.es'
CROSS JOIN (VALUES
  ('assets.read', 'Ver activos'),
  ('assets.create', 'Crear activo'),
  ('assets.update', 'Editar activo'),
  ('assets.delete', 'Eliminar activo'),
  ('assets.retire', 'Dar de baja activo'),
  ('assignments.read', 'Ver asignaciones'),
  ('assignments.create', 'Crear asignacion'),
  ('assignments.update', 'Editar asignacion'),
  ('assignments.delete', 'Eliminar asignacion'),
  ('employees.read', 'Ver empleados'),
  ('employees.create', 'Crear empleado'),
  ('employees.update', 'Editar empleado'),
  ('employees.delete', 'Eliminar empleado'),
  ('assetModels.read', 'Ver modelos de activo'),
  ('assetModels.create', 'Crear modelo de activo'),
  ('assetModels.update', 'Editar modelo de activo'),
  ('assetModels.delete', 'Eliminar modelo de activo'),
  ('assetBrands.read', 'Ver marcas de activo'),
  ('assetBrands.create', 'Crear marca de activo'),
  ('assetBrands.update', 'Editar marca de activo'),
  ('assetBrands.delete', 'Eliminar marca de activo'),
  ('assetTypes.read', 'Ver tipos de activo'),
  ('assetTypes.create', 'Crear tipo de activo'),
  ('assetTypes.update', 'Editar tipo de activo'),
  ('assetTypes.delete', 'Eliminar tipo de activo'),
  ('assetOsFamilies.read', 'Ver familias de OS'),
  ('assetOsFamilies.create', 'Crear familia de OS'),
  ('assetOsFamilies.update', 'Editar familia de OS'),
  ('assetOsFamilies.delete', 'Eliminar familia de OS'),
  ('osVersions.read', 'Ver versiones de OS'),
  ('osVersions.create', 'Crear version de OS'),
  ('osVersions.update', 'Editar version de OS'),
  ('osVersions.delete', 'Eliminar version de OS'),
  ('assetCPU.read', 'Ver modelos de CPU'),
  ('assetCPU.create', 'Crear modelo de CPU'),
  ('assetCPU.update', 'Editar modelo de CPU'),
  ('assetCPU.delete', 'Eliminar modelo de CPU'),
  ('assetRAM.read', 'Ver opciones de RAM'),
  ('assetRAM.create', 'Crear opcion de RAM'),
  ('assetRAM.update', 'Editar opcion de RAM'),
  ('assetRAM.delete', 'Eliminar opcion de RAM'),
  ('assetStorage.read', 'Ver opciones de almacenamiento'),
  ('assetStorage.create', 'Crear opcion de almacenamiento'),
  ('assetStorage.update', 'Editar opcion de almacenamiento'),
  ('assetStorage.delete', 'Eliminar opcion de almacenamiento'),
  ('sections.read', 'Ver secciones'),
  ('sections.create', 'Crear seccion'),
  ('sections.update', 'Editar seccion'),
  ('sections.delete', 'Eliminar seccion'),
  ('maintenanceTypes.read', 'Ver tipos de mantenimiento'),
  ('maintenanceTypes.create', 'Crear tipo de mantenimiento'),
  ('maintenanceTypes.update', 'Editar tipo de mantenimiento'),
  ('maintenanceTypes.delete', 'Eliminar tipo de mantenimiento'),
  ('holidays.read', 'Ver festivos'),
  ('holidays.create', 'Crear festivo'),
  ('holidays.update', 'Editar festivo'),
  ('holidays.delete', 'Eliminar festivo'),
  ('users.read', 'Ver usuarios'),
  ('users.create', 'Crear usuario'),
  ('users.update', 'Editar usuario'),
  ('users.delete', 'Eliminar usuario'),
  ('roles.read', 'Ver roles'),
  ('roles.create', 'Crear rol'),
  ('roles.update', 'Editar rol'),
  ('roles.delete', 'Eliminar rol'),
  ('permissions.read', 'Ver permisos'),
  ('permissions.create', 'Crear permiso'),
  ('permissions.update', 'Editar permiso'),
  ('permissions.delete', 'Eliminar permiso'),
  ('sites.read', 'Ver sitios'),
  ('sites.create', 'Crear sitio'),
  ('sites.update', 'Editar sitio'),
  ('sites.delete', 'Eliminar sitio'),
  ('system.admin', 'Administrador del sistema (acceso total)'),
  ('system.read', 'Ver configuracion del sistema')
) AS p(code, name)
WHERE a.code = 'it'
ON CONFLICT (app_id, code) DO UPDATE
SET name = EXCLUDED.name, is_active = TRUE;

-- IT permissions -> role assignments
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN apps a ON a.id = r.app_id
JOIN permissions p ON p.app_id = a.id
WHERE a.code = 'it' AND r.code = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN apps a ON a.id = r.app_id AND a.code = 'it'
JOIN permissions p ON p.app_id = a.id
JOIN (VALUES
  ('assets.read'),('assets.create'),('assets.update'),('assets.delete'),('assets.retire'),
  ('assignments.read'),('assignments.create'),('assignments.update'),('assignments.delete'),
  ('employees.read'),('employees.create'),('employees.update'),('employees.delete'),
  ('assetModels.read'),('assetModels.create'),('assetModels.update'),('assetModels.delete'),
  ('assetBrands.read'),('assetBrands.create'),('assetBrands.update'),('assetBrands.delete'),
  ('assetTypes.read'),('assetTypes.create'),('assetTypes.update'),('assetTypes.delete'),
  ('assetOsFamilies.read'),('assetOsFamilies.create'),('assetOsFamilies.update'),('assetOsFamilies.delete'),
  ('osVersions.read'),('osVersions.create'),('osVersions.update'),('osVersions.delete'),
  ('assetCPU.read'),('assetCPU.create'),('assetCPU.update'),('assetCPU.delete'),
  ('assetRAM.read'),('assetRAM.create'),('assetRAM.update'),('assetRAM.delete'),
  ('assetStorage.read'),('assetStorage.create'),('assetStorage.update'),('assetStorage.delete'),
  ('sections.read'),('sections.create'),('sections.update'),('sections.delete'),
  ('maintenanceTypes.read'),('maintenanceTypes.create'),('maintenanceTypes.update'),('maintenanceTypes.delete'),
  ('holidays.read'),('holidays.create'),('holidays.update'),('holidays.delete'),
  ('system.read')
) AS v(code) ON v.code = p.code
WHERE r.code = 'it'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN apps a ON a.id = r.app_id AND a.code = 'it'
JOIN permissions p ON p.app_id = a.id AND p.code IN ('assets.read', 'employees.read')
WHERE r.code = 'viewer'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = 'admin'
JOIN apps a ON a.id = r.app_id AND a.code IN ('gespack','it')
WHERE u.email = 'ilopez@parcelontime.es'
ON CONFLICT DO NOTHING;
