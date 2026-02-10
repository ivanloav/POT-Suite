# Script para Crear Usuario Admin

## Opción 1: Usar el script TypeScript (Recomendado)

Desde el directorio `backend`:

```bash
cd backend
npm install  # si aún no lo has hecho
npx ts-node src/utils/generateHash.ts admin123
```

Esto generará el SQL que necesitas ejecutar en tu base de datos PostgreSQL.

## Opción 2: Usar Node.js directamente

Desde el directorio raíz del proyecto:

```bash
node scripts/generate-password-hash.js admin123
```

## Opción 3: Usar la API de registro

Una vez que el backend esté corriendo:

```bash
# Iniciar backend
cd backend
npm run dev

# En otra terminal
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "admin123",
    "roleCode": "admin"
  }'
```

## Opción 4: SQL directo con hash pre-generado

Hash para la contraseña `admin123`:
```
$2a$10$YourActualHashHere
```

Ejecuta en PostgreSQL:

```sql
-- Crear usuario admin
INSERT INTO app_users (email, password_hash)
VALUES ('admin@inventory.com', '$2a$10$K8xZ.8qJZ8Z8Z8Z8Z8Z8ZuQqQqQqQqQqQqQqQqQqQqQq');

-- Obtener el ID del usuario
SELECT id, email FROM app_users WHERE email = 'admin@inventory.com';

-- Asignar rol de admin (reemplaza el UUID)
INSERT INTO user_roles (user_id, role_id)
SELECT 
  (SELECT id FROM app_users WHERE email = 'admin@inventory.com'),
  (SELECT id FROM roles WHERE code = 'admin');

-- Verificar
SELECT u.id, u.email, r.code as role
FROM app_users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@inventory.com';
```

## Credenciales de prueba

Una vez creado el usuario, puedes iniciar sesión con:
- **Email**: `admin@inventory.com`
- **Password**: `admin123`

## Cambiar la contraseña después

Puedes cambiar la contraseña generando un nuevo hash con cualquiera de los scripts y actualizando la base de datos:

```sql
UPDATE app_users 
SET password_hash = '$2a$10$NuevoHashAqui'
WHERE email = 'admin@inventory.com';
```
