# Resolución de Problemas

Esta guía te ayudará a resolver los problemas más comunes al trabajar con IT Inventory.

## Problemas de Conexión a la Base de Datos

### Error: "connection refused" o "ECONNREFUSED"

**Causa:** El backend no puede conectarse a PostgreSQL.

**Soluciones:**

1. Verifica que PostgreSQL está corriendo
2. Verifica las credenciales en el archivo `.env`
3. Verifica que PostgreSQL acepta conexiones

### Error: "database does not exist"

**Causa:** La base de datos no ha sido creada.

**Solución:** Crea la base de datos y ejecuta el script de creación.

## Problemas de Autenticación

### Error: "Invalid credentials" al iniciar sesión

**Causa:** Usuario no existe o contraseña incorrecta.

### Error: "Token expired" o "Invalid token"

**Causa:** El token JWT ha expirado o es inválido.

## Problemas del Backend

### Error: "Port 3000 is already in use"

**Causa:** Otro proceso está usando el puerto 3000.

### Error: "Module not found" al iniciar el backend

**Causa:** Dependencias no instaladas correctamente.

## Problemas del Frontend

### Página en blanco o error "Failed to fetch"

**Causa:** El frontend no puede comunicarse con el backend.

### Error: "npm ERR! peer dependency"

**Causa:** Incompatibilidad de versiones de dependencias.

## Problemas de Permisos

### Error: "Insufficient permissions"

**Causa:** El usuario no tiene los permisos necesarios para la operación.

## Obtener Ayuda Adicional

Si ninguna de estas soluciones resuelve tu problema, consulta la documentación de la API o contacta al equipo de soporte.
