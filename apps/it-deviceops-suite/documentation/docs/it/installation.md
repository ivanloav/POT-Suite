# Instalación

Esta guía proporciona instrucciones detalladas para instalar y configurar el sistema IT Inventory.

## Requisitos Previos

Antes de comenzar con la instalación, asegúrate de tener instalado:

- **Node.js** 18 o superior
- **npm** (incluido con Node.js)
- **PostgreSQL** 14 o superior
- **Git** para clonar el repositorio
- **Docker** (opcional, para ejecutar PostgreSQL en contenedor)

## Instalación del Backend

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ivanloav/IT-Inventory-POT.git
cd IT-Inventory-POT/backend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita las variables:

```bash
cp .env.example .env
```

Configura las siguientes variables en el archivo `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=it_inventory
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_password_postgres

# JWT Configuration
JWT_SECRET=cambia-esto-por-una-clave-secreta-segura
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Configurar la Base de Datos

Ejecuta el script SQL para crear la estructura de la base de datos:

```bash
psql -U tu_usuario -d it_inventory -f ../scripts/create-DB.psql
```

### 5. Iniciar el Backend

#### Modo Desarrollo

```bash
npm run dev
```

#### Modo Producción

```bash
npm run build
npm start
```

El backend estará disponible en `http://localhost:3000`

## Instalación del Frontend

### 1. Navegar al Directorio del Frontend

```bash
cd ../frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar el Proxy (Opcional)

El frontend ya está configurado para hacer proxy de las peticiones `/api` al backend. Si necesitas cambiar la URL del backend, edita `vite.config.ts`.

### 4. Iniciar el Frontend

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Verificación de la Instalación

1. Abre tu navegador y navega a `http://localhost:5173`
2. Deberías ver la página de login del sistema
3. Verifica que el backend responde visitando `http://localhost:3000/api/health` (si existe el endpoint)

## Pruebas

### Tests Unitarios (Backend)

Ejecuta los tests unitarios con Jest:

```bash
cd backend
npm run test
```

### Tests de Integración (Auth)

Ejecuta el flujo `login → refresh → profile` contra tu base de datos real.
Requiere un usuario existente y el backend configurado:

```bash
cd backend
E2E_EMAIL="tu@email.com" E2E_PASSWORD="tu_password" npm run test
```

### Smoke Test de Autenticación

Verifica el flujo `login → refresh → profile` con un usuario real (backend debe estar corriendo):

```bash
cd backend
SMOKE_EMAIL="tu@email.com" SMOKE_PASSWORD="tu_password" npm run test:smoke
```

Si tu API no corre en `http://localhost:3000`, puedes especificar `API_URL`:

```bash
API_URL="http://localhost:3000/api" SMOKE_EMAIL="tu@email.com" SMOKE_PASSWORD="tu_password" npm run test:smoke
```

### Tests Unitarios (Frontend)

```bash
cd frontend
npm run test
```

### Tests E2E (Frontend)

Requiere frontend y backend corriendo, más credenciales válidas:

```bash
cd frontend
E2E_EMAIL="tu@email.com" E2E_PASSWORD="tu_password" npm run test:e2e
```

## Instalación con Docker (Opcional)

Si prefieres usar Docker para PostgreSQL:

```bash
docker run --name it-inventory-db \
  -e POSTGRES_USER=tu_usuario \
  -e POSTGRES_PASSWORD=tu_password \
  -e POSTGRES_DB=it_inventory \
  -p 5432:5432 \
  -d postgres:14
```

## Siguientes Pasos

- Revisa la [Guía de Inicio](/docs/user/getting-started) para comenzar a usar el sistema
- Consulta la [Resolución de Problemas](/docs/it/troubleshooting) si encuentras algún error
- Explora la [Referencia de API](/docs/it/api-reference) para integrar con otros sistemas
