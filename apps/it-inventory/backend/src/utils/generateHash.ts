// Script para generar hash de contraseña bcrypt
// Ejecutar desde el directorio backend: node src/utils/generateHash.js <password>

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('\n=== Generador de Hash de Contraseña ===\n');
console.log('Contraseña:', password);
console.log('Hash:', hash);
console.log('\n=== SQL para insertar en la base de datos ===\n');
console.log(`-- Crear usuario admin
INSERT INTO app_users (email, password_hash)
VALUES ('admin@inventory.com', '${hash}');

-- Asignar acceso al site (reemplazar 1 con el site_id deseado)
INSERT INTO user_sites (user_id, site_id, is_active)
SELECT 
  (SELECT id FROM app_users WHERE email = 'admin@inventory.com'),
  1,  -- Cambiar por el site_id correcto
  true;

-- Asignar rol de admin para el site
INSERT INTO user_site_roles (user_id, site_id, role_id)
SELECT 
  (SELECT id FROM app_users WHERE email = 'admin@inventory.com'),
  1,  -- Cambiar por el site_id correcto
  (SELECT id FROM roles WHERE code = 'admin');

-- Verificar
SELECT u.id, u.email, s.code as site, r.code as role
FROM app_users u
JOIN user_sites us ON u.id = us.user_id
JOIN sites s ON us.site_id = s.site_id
JOIN user_site_roles usr ON u.id = usr.user_id AND s.site_id = usr.site_id
JOIN roles r ON usr.role_id = r.id
WHERE u.email = 'admin@inventory.com';
`);
