const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkPermissions() {
  try {
    console.log('Verificando permisos del usuario admin@inventory.com...\n');

    // 1. Verificar que el usuario existe
    const userResult = await pool.query(
      'SELECT id, email, is_active FROM app_users WHERE email = $1',
      ['admin@inventory.com']
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Usuario admin@inventory.com NO EXISTE');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Activo:', user.is_active);
    console.log('');

    // 2. Verificar roles asignados
    const rolesResult = await pool.query(
      `SELECT r.id, r.code, r.name 
       FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    console.log('📋 Roles asignados:');
    if (rolesResult.rows.length === 0) {
      console.log('   ❌ NO TIENE ROLES ASIGNADOS');
    } else {
      rolesResult.rows.forEach(role => {
        console.log(`   - ${role.name} (${role.code})`);
      });
    }
    console.log('');

    // 3. Verificar permisos
    const permissionsResult = await pool.query(
      `SELECT DISTINCT p.code, p.name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1 AND p.is_active = true
       ORDER BY p.code`,
      [user.id]
    );

    console.log('🔐 Permisos:');
    if (permissionsResult.rows.length === 0) {
      console.log('   ❌ NO TIENE PERMISOS ASIGNADOS');
    } else {
      permissionsResult.rows.forEach(perm => {
        console.log(`   ✅ ${perm.code} - ${perm.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPermissions();
