# Guía de Despliegue y Puesta en Producción - Docusaurus

Esta guía proporciona instrucciones paso a paso para desplegar y poner en producción un sitio web de documentación con Docusaurus.

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#-prerrequisitos)
2. [Instalación](#-instalación)
3. [Ejecución en Desarrollo](#-ejecución-en-desarrollo)
4. [Construcción para Producción](#-construcción-para-producción)
5. [Despliegue en Producción](#-despliegue-en-producción)
6. [Solución de Problemas](#-solución-de-problemas)

---

## 🔧 Prerrequisitos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

### Herramientas Necesarias

#### 1. Node.js (versión 20.0 o superior)
Node.js es el entorno de ejecución necesario para Docusaurus.

**Verificar si Node.js está instalado:**
```bash
node --version
```

**Instalar Node.js en Ubuntu/Debian:**
```bash
# Actualizar paquetes del sistema
sudo apt update

# Instalar Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar la instalación
node --version
npm --version
```

**Instalar Node.js en Windows:**
- Descargar el instalador desde: https://nodejs.org/
- Ejecutar el instalador y seguir las instrucciones
- Reiniciar la terminal después de la instalación

**Instalar Node.js en macOS:**
```bash
# Usando Homebrew
brew install node@20

# Verificar la instalación
node --version
npm --version
```

#### 2. npm (Node Package Manager)
npm se instala automáticamente con Node.js y es necesario para gestionar las dependencias del proyecto.

**Verificar versión de npm:**
```bash
npm --version
```

#### 3. Git
Git es necesario para clonar el repositorio y gestionar el control de versiones.

**Instalar Git en Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install git -y

# Verificar la instalación
git --version
```

**Instalar Git en Windows:**
- Descargar desde: https://git-scm.com/download/win
- Ejecutar el instalador

**Instalar Git en macOS:**
```bash
brew install git
```

### Preparación del Entorno

#### Opción 1: Despliegue Local (Desarrollo)
Para desarrollo local, solo necesitas tener Node.js, npm y Git instalados en tu máquina.

**Requisitos mínimos:**
- CPU: 2 cores
- RAM: 4 GB
- Espacio en disco: 1 GB libre
- Sistema operativo: Windows 10+, macOS 10.15+, Ubuntu 18.04+

#### Opción 2: Despliegue en Servidor (Producción)

**Para un servidor Linux (Ubuntu/Debian):**

1. **Acceder al servidor:**
```bash
ssh usuario@ip-del-servidor
```

2. **Actualizar el sistema:**
```bash
sudo apt update && sudo apt upgrade -y
```

3. **Instalar dependencias del sistema:**
```bash
sudo apt install -y curl git build-essential
```

4. **Configurar firewall (si es necesario):**
```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS (si usarás Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activar firewall
sudo ufw enable
```

**Requisitos recomendados para servidor:**
- CPU: 2+ cores
- RAM: 2 GB mínimo, 4 GB recomendado
- Espacio en disco: 10 GB libre
- Sistema operativo: Ubuntu 20.04 LTS o superior

---

## 📦 Instalación

### Paso 1: Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/ivanloav/IT-Inventory-POT.git

# Navegar al directorio del proyecto
cd IT-Inventory-POT

# Navegar al directorio de la documentación de Docusaurus
cd documentation/website
```

### Paso 2: Instalar Dependencias

Una vez dentro del directorio `documentation/website`, instala todas las dependencias necesarias:

```bash
# Instalar dependencias del proyecto
npm install
```

Este comando leerá el archivo `package.json` e instalará:
- Docusaurus core v3.9.2
- React v19.0.0
- Todas las dependencias necesarias para el sitio

**Nota:** La instalación puede tardar varios minutos dependiendo de tu conexión a internet.

### Paso 3: Verificar la Instalación

Verifica que las dependencias se instalaron correctamente:

```bash
# Listar las dependencias instaladas
npm list --depth=0

# Verificar que Docusaurus está disponible
npx docusaurus --version
```

### Paso 4: Configuración Inicial

Docusaurus utiliza el archivo `docusaurus.config.ts` para su configuración. Para este proyecto, la configuración ya está lista, pero es importante revisar algunos parámetros clave:

```bash
# Ver la configuración actual
cat docusaurus.config.ts
```

**Parámetros importantes a revisar:**

1. **`url`**: La URL donde se alojará tu sitio (ej: `https://tudominio.com`)
2. **`baseUrl`**: La ruta base del sitio (ej: `/` o `/IT-Inventory-POT/`)
3. **`organizationName`**: Tu nombre de usuario o organización en GitHub
4. **`projectName`**: Nombre del repositorio

**Ejemplo de configuración para GitHub Pages:**
```typescript
const config = {
  title: 'IT Inventory Documentation',
  url: 'https://ivanloav.github.io',
  baseUrl: '/IT-Inventory-POT/',
  organizationName: 'ivanloav',
  projectName: 'IT-Inventory-POT',
  // ... resto de la configuración
};
```

---

## 🚀 Ejecución en Desarrollo

Para desarrollar y previsualizar el sitio localmente:

### Iniciar el Servidor de Desarrollo

```bash
# Desde el directorio documentation/website
npm run start
```

Este comando:
1. Compila el sitio
2. Inicia un servidor de desarrollo local
3. Abre automáticamente el navegador en `http://localhost:3000`
4. Habilita la recarga en caliente (hot reload) - los cambios se reflejan automáticamente

**Salida esperada:**
```
[INFO] Starting the development server...
[SUCCESS] Docusaurus website is running at: http://localhost:3000/
```

### Opciones del Servidor de Desarrollo

```bash
# Especificar un puerto diferente
npm run start -- --port 3001

# Especificar un host diferente (útil para acceso desde red local)
npm run start -- --host 0.0.0.0

# Deshabilitar la apertura automática del navegador
npm run start -- --no-open
```

### Acceder desde otra máquina en la red local

Si estás ejecutando el servidor en una VM o servidor y quieres acceder desde otra máquina:

```bash
# Iniciar con host 0.0.0.0
npm run start -- --host 0.0.0.0 --port 3000
```

Luego accede desde otro dispositivo usando:
```
http://IP-DEL-SERVIDOR:3000
```

### Detener el Servidor de Desarrollo

Para detener el servidor, presiona `Ctrl + C` en la terminal donde se está ejecutando.

---

## 🏗️ Construcción para Producción

Para generar los archivos estáticos optimizados para producción:

### Paso 1: Generar el Build

```bash
# Desde el directorio documentation/website
npm run build
```

Este comando:
1. Compila y optimiza todos los archivos
2. Minimiza el código JavaScript y CSS
3. Genera archivos estáticos en la carpeta `build/`
4. Realiza optimizaciones de rendimiento

**Salida esperada:**
```
[INFO] Creating an optimized production build...
[SUCCESS] Generated static files in "build".
[INFO] Use `npm run serve` to test your build locally.
```

### Paso 2: Verificar el Build Localmente

Antes de desplegar en producción, es recomendable probar el build localmente:

```bash
# Servir el build localmente
npm run serve
```

El sitio estará disponible en `http://localhost:3000` (o el puerto que indique la consola).

### Contenido de la Carpeta build/

Después de ejecutar `npm run build`, la carpeta `build/` contendrá:

```
build/
├── assets/           # JavaScript, CSS y otros recursos
├── img/             # Imágenes optimizadas
├── docs/            # Documentación en HTML
├── index.html       # Página principal
├── 404.html         # Página de error 404
└── sitemap.xml      # Mapa del sitio para SEO
```

### Limpieza de Caché

Si experimentas problemas con el build, limpia la caché:

```bash
# Limpiar caché de Docusaurus
npm run clear

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Generar build nuevamente
npm run build
```

---

## 🌐 Despliegue en Producción

Existen varias opciones para desplegar el sitio en producción. A continuación se detallan las más comunes:

### Opción 1: Despliegue con Nginx (Recomendado para Servidores)

Esta opción es ideal si tienes tu propio servidor Linux (VM, VPS, servidor dedicado).

#### Paso 1: Instalar Nginx

```bash
# Actualizar repositorios
sudo apt update

# Instalar Nginx
sudo apt install nginx -y

# Verificar que Nginx está ejecutándose
sudo systemctl status nginx

# Iniciar Nginx si no está ejecutándose
sudo systemctl start nginx

# Habilitar Nginx para que inicie automáticamente
sudo systemctl enable nginx
```

#### Paso 2: Copiar Archivos del Build al Servidor

**Opción A: Si estás trabajando directamente en el servidor:**
```bash
# Navegar al directorio del proyecto
cd /home/usuario/IT-Inventory-POT/documentation/website

# Generar el build
npm run build

# Copiar archivos a la carpeta de Nginx
sudo cp -r build/* /var/www/html/docs/

# Establecer permisos correctos
sudo chown -R www-data:www-data /var/www/html/docs/
sudo chmod -R 755 /var/www/html/docs/
```

**Opción B: Si generas el build en tu máquina local y lo subes al servidor:**
```bash
# En tu máquina local, generar el build
npm run build

# Comprimir la carpeta build
tar -czf docusaurus-build.tar.gz build/

# Copiar al servidor usando SCP
scp docusaurus-build.tar.gz usuario@ip-del-servidor:/tmp/

# En el servidor, descomprimir y mover
ssh usuario@ip-del-servidor
cd /tmp
tar -xzf docusaurus-build.tar.gz
sudo cp -r build/* /var/www/html/docs/
sudo chown -R www-data:www-data /var/www/html/docs/
sudo chmod -R 755 /var/www/html/docs/
```

#### Paso 3: Configurar Nginx

Crear un archivo de configuración para el sitio:

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/docusaurus
```

**Contenido del archivo para un sitio simple:**
```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name tu-dominio.com www.tu-dominio.com;
    
    root /var/www/html/docs;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Caché para recursos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

#### Paso 4: Activar la Configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/docusaurus /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Verificar la configuración de Nginx
sudo nginx -t

# Recargar Nginx para aplicar cambios
sudo systemctl reload nginx
```

#### Paso 5: Configurar HTTPS con Let's Encrypt (Opcional pero Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# El certificado se renovará automáticamente
# Verificar la renovación automática
sudo certbot renew --dry-run
```

### Opción 2: Despliegue en GitHub Pages (Gratuito)

GitHub Pages es una excelente opción gratuita para alojar sitios estáticos.

#### Paso 1: Configurar el Repositorio

Asegúrate de que el archivo `docusaurus.config.ts` tenga la configuración correcta:

```typescript
const config = {
  url: 'https://ivanloav.github.io',
  baseUrl: '/IT-Inventory-POT/',
  organizationName: 'ivanloav',
  projectName: 'IT-Inventory-POT',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
};
```

#### Paso 2: Configurar Git

```bash
# Configurar credenciales de Git (si no lo has hecho)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@example.com"
```

#### Paso 3: Desplegar

```bash
# Desde el directorio documentation/website

# Si usas SSH para Git:
GIT_USER=tu-usuario npm run deploy

# Si usas HTTPS con token de GitHub:
GIT_USER=tu-usuario GIT_PASS=tu-token npm run deploy
```

Este comando:
1. Genera el build de producción
2. Crea o actualiza la rama `gh-pages`
3. Sube los archivos al repositorio

#### Paso 4: Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** > **Pages**
3. En **Source**, selecciona la rama `gh-pages` y la carpeta `/ (root)`
4. Haz clic en **Save**

Tu sitio estará disponible en: `https://ivanloav.github.io/IT-Inventory-POT/`

### Opción 3: Despliegue con PM2 y Servidor Node.js

Si prefieres servir el sitio usando Node.js:

#### Paso 1: Instalar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2
```

#### Paso 2: Crear Script de Servidor

```bash
# Crear archivo server.js en documentation/website
nano server.js
```

**Contenido de server.js:**
```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'build')));

// Manejar rutas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Docusaurus está corriendo en http://localhost:${PORT}`);
});
```

#### Paso 3: Instalar Express

```bash
npm install express
```

#### Paso 4: Iniciar con PM2

```bash
# Generar build
npm run build

# Iniciar con PM2
pm2 start server.js --name docusaurus-site

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar en arranque del sistema
pm2 startup
# Ejecutar el comando que PM2 te indique
```

#### Paso 5: Gestionar el Proceso

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs docusaurus-site

# Reiniciar
pm2 restart docusaurus-site

# Detener
pm2 stop docusaurus-site

# Eliminar del PM2
pm2 delete docusaurus-site
```

### Opción 4: Despliegue en Servicios Cloud

#### Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde el directorio documentation/website
vercel

# Para producción
vercel --prod
```

#### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Desde el directorio documentation/website
netlify deploy

# Para producción
netlify deploy --prod
```

---

## 🔍 Solución de Problemas

### Error: "Cannot find module"

**Problema:** Faltan dependencias o node_modules está corrupto.

**Solución:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 is already in use"

**Problema:** El puerto está ocupado por otro proceso.

**Solución:**
```bash
# Usar otro puerto
npm run start -- --port 3001

# O detener el proceso que usa el puerto 3000
# En Linux/Mac:
lsof -ti:3000 | xargs kill -9

# En Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error durante el Build

**Problema:** Errores de compilación o enlaces rotos.

**Solución:**
```bash
# Limpiar caché
npm run clear

# Verificar enlaces rotos (si está configurado)
npm run build 2>&1 | grep -i "broken"

# Revisar los logs para identificar el archivo problemático
```

### Problemas de Permisos en Nginx

**Problema:** Error 403 Forbidden o archivos no se sirven correctamente.

**Solución:**
```bash
# Verificar permisos
ls -la /var/www/html/docs/

# Corregir permisos
sudo chown -R www-data:www-data /var/www/html/docs/
sudo chmod -R 755 /var/www/html/docs/

# Verificar configuración de SELinux (si está habilitado)
sudo setenforce 0  # Temporalmente, para diagnóstico
```

### Sitio no se Actualiza después del Deploy

**Problema:** Los cambios no se reflejan en el sitio.

**Solución:**
```bash
# Limpiar caché del navegador (Ctrl + Shift + R)

# En Nginx, limpiar caché
sudo systemctl reload nginx

# Verificar que se copiaron los archivos correctos
ls -la /var/www/html/docs/

# Regenerar build
npm run clear
npm run build
```

### Error "JavaScript heap out of memory"

**Problema:** Node.js se queda sin memoria durante el build.

**Solución:**
```bash
# Aumentar límite de memoria de Node.js
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build

# O agregar al package.json:
"scripts": {
  "build": "NODE_OPTIONS='--max_old_space_size=4096' docusaurus build"
}
```

---

## 📚 Recursos Adicionales

- **Documentación oficial de Docusaurus:** https://docusaurus.io/
- **Guía de configuración de Nginx:** https://nginx.org/en/docs/
- **Let's Encrypt / Certbot:** https://certbot.eff.org/
- **GitHub Pages:** https://pages.github.com/
- **PM2 Documentation:** https://pm2.keymetrics.io/

---

## ✅ Checklist de Despliegue

Usa esta lista para verificar que completaste todos los pasos:

### Desarrollo
- [ ] Node.js 20+ instalado
- [ ] npm instalado
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor de desarrollo funcionando (`npm run start`)

### Producción
- [ ] Build generado correctamente (`npm run build`)
- [ ] Build probado localmente (`npm run serve`)
- [ ] Servidor web configurado (Nginx o GitHub Pages)
- [ ] Archivos copiados al servidor
- [ ] Permisos configurados correctamente
- [ ] Sitio accesible desde el navegador
- [ ] HTTPS configurado (opcional pero recomendado)
- [ ] DNS configurado (si usas dominio propio)

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí y seguiste todos los pasos, tu sitio de documentación Docusaurus debería estar funcionando en producción. 

Para cualquier problema o pregunta adicional, consulta la documentación oficial de Docusaurus o abre un issue en el repositorio del proyecto.

**¡Disfruta de tu nueva documentación!** 📖✨
