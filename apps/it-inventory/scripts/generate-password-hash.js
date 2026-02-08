// Script para generar hash de contraseña
// Ejecutar desde: cd backend && node ../scripts/generate-password-hash.js <password>

const path = require('path');
const bcrypt = require(path.join(__dirname, '../backend/node_modules/bcryptjs'));

const password = process.argv[2] || 'P@rcel2025';
const hash = bcrypt.hashSync(password, 10);

console.log('\n=== Generador de Hash de Contraseña ===\n');
console.log('Contraseña:', password);
console.log('Hash:', hash);
console.log('\nUsa este hash en tu base de datos:\n');
console.log(`INSERT INTO app_users (email, password_hash)
VALUES ('ilopez@parcelontime.es', '${hash}');

-- Asignar rol de admin
INSERT INTO user_roles (user_id, role_id)
SELECT 
  (SELECT id FROM app_users WHERE email = 'ilopez@parcelontime.es'),
  (SELECT id FROM roles WHERE code = 'admin');
`);
