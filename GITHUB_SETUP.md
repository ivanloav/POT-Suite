# Instrucciones para subir Operations Hub a GitHub

Este documento te guía para reiniciar el historial de Git y subir el proyecto renombrado a un nuevo repositorio de GitHub.

## ⚠️ Importante

El proyecto ha sido **completamente renombrado**:
- **POT-Suite** → **Operations Hub**
- **IT Inventory** → **IT DeviceOps Suite**
- Carpetas, paquetes, componentes y referencias actualizadas

## 🔄 Pasos para crear nuevo repositorio

### 1. Eliminar historial de Git existente (opcional)

Si quieres empezar con un historial limpio:

```bash
# Desde la raíz del proyecto
cd /Users/ivan/Documents/VSCode-POT/POT-Suite

# Eliminar la carpeta .git
rm -rf .git

# Inicializar nuevo repositorio
git init
```

### 2. Agregar archivos al staging

```bash
# Ver estado
git status

# Agregar todos los archivos
git add .

# Verificar qué se va a commitear
git status
```

### 3. Hacer commit inicial

```bash
git commit -m "Initial commit: Operations Hub monorepo

- Operations Hub: Centralized authentication portal
- GesPack: Package management system  
- IT DeviceOps Suite: IT inventory and asset management
- @pot/ui-kit: Shared UI components

Renamed from POT-Suite to Operations Hub for clarity.
All references, components, and documentation updated."
```

### 4. Crear repositorio en GitHub

1. Ve a https://github.com/new (o tu organización)
2. Nombre sugerido: **`OperationsHub`** o **`operations-hub`**
3. **NO** inicialices con README, .gitignore o licencia (ya los tenemos)
4. Crea el repositorio vacío

### 5. Agregar remote y push

```bash
# Agregar remote (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/OperationsHub.git

# O con SSH:
# git remote add origin git@github.com:TU_USUARIO/OperationsHub.git

# Renombrar branch a main (si es necesario)
git branch -M main

# Push inicial
git push -u origin main
```

## 🔒 Antes de subir: Verificar variables sensibles

**IMPORTANTE**: Asegúrate de NO subir credenciales. Revisa:

```bash
# Buscar archivos .env (no deberían estar en git)
find . -name ".env" -not -path "*/node_modules/*"

# Buscar contraseñas o secretos en archivos
grep -r "password\|secret\|jwt" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules .
```

### Archivos a revisar manualmente:

- `docker-compose.db.yml` - Contiene credenciales de base de datos
- Scripts en `db/init/*.sql` - Pueden tener usuarios de ejemplo
- Variables de entorno en README

**Considera** crear archivos `.env.example` sin valores reales:

```bash
# Ejemplo para backend
cat > apps/gespack/backend/.env.example << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5433/operations_hub
JWT_SECRET=your-secret-here
SUITE_JWT_SECRET=your-suite-secret
PORT=3000
NODE_ENV=development
EOF
```

## 📋 Checklist antes del push

- [ ] Eliminar o actualizar credenciales en docker-compose.db.yml
- [ ] Crear .env.example sin valores reales
- [ ] Verificar que .gitignore incluya .env
- [ ] Revisar README.md y actualizar URLs de Git
- [ ] Verificar que node_modules/ no esté en el repo
- [ ] Probar que `npm install` funcione después de clonar

## 🎯 Estructura final en GitHub

```
github.com/TU_USUARIO/OperationsHub/
├── README.md                     # Documentación principal
├── package.json                  # Workspaces config
├── .gitignore                    # Archivos ignorados
├── docker-compose.db.yml         # Base de datos
├── apps/
│   ├── operations-hub/           # Portal de autenticación
│   ├── gespack/                  # Sistema de paquetería
│   └── it-deviceops-suite/       # Inventario IT
├── packages/
│   └── ui-kit/                   # Componentes compartidos
└── db/
    └── init/                     # Scripts SQL
```

## 🔐 Configurar GitHub Actions (opcional)

Si quieres CI/CD, puedes crear workflows para:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run gespack:frontend:build
      - run: npm run it:frontend:build
```

## 🌐 URLs esperadas

Después de subir:

- Repositorio: `https://github.com/TU_USUARIO/OperationsHub`
- Issues: `https://github.com/TU_USUARIO/OperationsHub/issues`
- Clone: `git clone https://github.com/TU_USUARIO/OperationsHub.git`

## 💡 Tips finales

1. **Branch protection**: Activa protección en `main` para requerir pull requests
2. **Tags**: Usa tags semánticos para releases (`v1.0.0`, `v1.1.0`)
3. **GitHub Projects**: Considera usar Projects para gestión de tareas
4. **Wiki**: Puedes mover documentación extensa a la Wiki de GitHub

## ✅ Verificación post-push

```bash
# Clonar en carpeta temporal para verificar
cd /tmp
git clone https://github.com/TU_USUARIO/OperationsHub.git
cd OperationsHub

# Instalar dependencias
npm install

# Probar scripts
npm run hub:dev
```

---

**Nota**: Estos pasos asumen que estás creando un repositorio **privado** o que has eliminado **todas las credenciales** antes de hacerlo público.
