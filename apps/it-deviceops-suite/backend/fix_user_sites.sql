-- Verificar si el usuario 3 tiene registros en user_sites
SELECT * FROM user_sites WHERE user_id = 3;

-- Si no existe, insertar basándose en los datos de user_site_roles
INSERT INTO user_sites (user_id, site_id, is_active)
SELECT DISTINCT user_id, site_id, true
FROM user_site_roles
WHERE user_id = 3
ON CONFLICT (user_id, site_id) DO NOTHING;

-- Verificar que se insertó correctamente
SELECT * FROM user_sites WHERE user_id = 3;

-- También verificar para user_id=2 por si acaso
SELECT * FROM user_sites WHERE user_id = 2;

INSERT INTO user_sites (user_id, site_id, is_active)
SELECT DISTINCT user_id, site_id, true
FROM user_site_roles
WHERE user_id = 2
ON CONFLICT (user_id, site_id) DO NOTHING;

-- Verificar resultado final
SELECT 
  u.id as user_id,
  u.user_name,
  us.site_id,
  s.name as site_name,
  us.is_active
FROM app_users u
LEFT JOIN user_sites us ON u.id = us.user_id
LEFT JOIN sites s ON us.site_id = s.site_id
WHERE u.id IN (2, 3)
ORDER BY u.id, us.site_id;
