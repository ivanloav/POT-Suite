-- Agregar el nuevo permiso system.read
INSERT INTO permissions (code, name, created_by, is_active)
VALUES ('system.read', 'Ver configuración del sistema', 1, true)
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name, is_active = true;

-- Actualizar el nombre de system.admin para que sea más claro
UPDATE permissions 
SET name = 'Administración del Sistema (Total)' 
WHERE code = 'system.admin';

-- Obtener los IDs necesarios
DO $$
DECLARE
  role_it_id INT;
  role_admin_id INT;
  perm_system_read_id INT;
  perm_system_admin_id INT;
BEGIN
  -- Obtener IDs de roles
  SELECT id INTO role_it_id FROM roles WHERE code = 'it';
  SELECT id INTO role_admin_id FROM roles WHERE code = 'admin';
  
  -- Obtener IDs de permisos
  SELECT id INTO perm_system_read_id FROM permissions WHERE code = 'system.read';
  SELECT id INTO perm_system_admin_id FROM permissions WHERE code = 'system.admin';
  
  -- Eliminar system.admin del rol IT (si existe)
  DELETE FROM role_permissions 
  WHERE role_id = role_it_id AND permission_id = perm_system_admin_id;
  
  -- Agregar system.read al rol IT
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES (role_it_id, perm_system_read_id)
  ON CONFLICT DO NOTHING;
  
  -- Asegurar que admin tiene system.admin
  INSERT INTO role_permissions (role_id, permission_id)
  VALUES (role_admin_id, perm_system_admin_id)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Permisos actualizados correctamente';
END $$;

-- Verificar el resultado
SELECT 
  r.code as rol,
  r.name as nombre_rol,
  p.code as permiso_codigo,
  p.name as permiso_nombre
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code IN ('system.admin', 'system.read')
ORDER BY r.code, p.code;
