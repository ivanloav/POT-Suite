# 🚀 Inicio Rápido - IT Inventory

## ✅ Pasos para poner en marcha la aplicación

### 1️⃣ Instalar Dependencias Backend
```bash
cd backend
npm install
```

### 2️⃣ Configurar Variables de Entorno
```bash
cd backend
cp .env.example .env
nano .env  # o usa tu editor favorito
```

Edita el archivo `.env` con tus datos:
```env
DB_HOST=tu-ip-servidor-ubuntu
DB_PORT=5432
DB_NAME=it_inventory
DB_USER=tu_usuario
DB_PASSWORD=tu_password

JWT_SECRET=cambia-esto-por-algo-seguro-y-largo
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

### 3️⃣ Crear Usuario Administrador

**Opción A: Script rápido**
```bash
# Desde la raíz del proyecto
node scripts/generate-password-hash.js admin123
```

Copia el SQL generado y ejecútalo en tu base de datos PostgreSQL.

**Opción B: Usando la API (después de arrancar el backend)**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "admin123",
    "roleCode": "admin"
  }'
```

### 4️⃣ Iniciar Backend
```bash
cd backend
npm run dev
```

Deberías ver:
```
📊 Conectado a la base de datos PostgreSQL
✅ Conexión a la base de datos exitosa
🚀 Servidor corriendo en http://localhost:3000
```

### 5️⃣ Instalar Dependencias Frontend
```bash
cd frontend
npm install
```

### 6️⃣ Iniciar Frontend
```bash
cd frontend
npm run dev
```

El frontend estará disponible en: http://localhost:5173

### 7️⃣ Acceder a la Aplicación

1. Abre tu navegador en: **http://localhost:5173**
2. Usa las credenciales:
   - **Email**: `admin@inventory.com`
   - **Password**: `admin123`

## 🔧 Solución de Problemas

### Error: Cannot connect to database
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Verifica que el puerto 5432 esté accesible

### Error: Port 3000 already in use
```bash
# Encuentra el proceso
lsof -ti:3000

# Mata el proceso
kill -9 <PID>
```

### Error: Token inválido
- Verifica que JWT_SECRET sea el mismo en backend y no esté vacío
- Limpia localStorage del navegador y vuelve a hacer login

### Frontend no conecta con Backend
- Verifica que el backend esté corriendo en puerto 3000
- El proxy está configurado en `frontend/vite.config.ts`

## 📝 Comandos Útiles

```bash
# Backend - Modo desarrollo con recarga automática
cd backend && npm run dev

# Backend - Compilar para producción
cd backend && npm run build

# Frontend - Modo desarrollo
cd frontend && npm run dev

# Frontend - Compilar para producción
cd frontend && npm run build

# Ver estructura de la base de datos
psql -U tu_usuario -d it_inventory -c "\dt"

# Crear respaldo de la BD
pg_dump -U tu_usuario it_inventory > backup.sql
```

## 🎯 Siguiente Paso

Explora la aplicación:
- **Dashboard**: Vista general de estadísticas
- **Activos**: Gestión de inventario IT
- **Empleados**: Lista de empleados
- **Asignaciones**: Asignar activos a empleados

¡Listo para usar! 🎉
