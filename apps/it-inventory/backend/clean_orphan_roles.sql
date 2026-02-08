-- Limpiar registros huérfanos en user_site_roles
DELETE FROM user_site_roles WHERE user_id NOT IN (SELECT id FROM app_users);
DELETE FROM user_site_roles WHERE site_id NOT IN (SELECT site_id FROM sites);
DELETE FROM user_site_roles WHERE role_id NOT IN (SELECT id FROM roles);

-- Limpiar registros huérfanos en user_sites
DELETE FROM user_sites WHERE user_id NOT IN (SELECT id FROM app_users);
DELETE FROM user_sites WHERE site_id NOT IN (SELECT site_id FROM sites);

SELECT 'Registros limpiados exitosamente' as mensaje;
