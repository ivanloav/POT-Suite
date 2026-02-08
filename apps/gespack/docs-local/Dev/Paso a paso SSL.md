# 🌐 Manual paso a paso para servir GesPack por HTTPS tras configurar Stormshield

Este manual está pensado para seguirse paso a paso, como si fuera la primera vez que haces esto. Incluye todos los comandos y explicaciones necesarias.

---

## 🔒 Paso 1: Configurar Stormshield (antes de tocar el servidor)

### 1.1 Crear reglas NAT

Redirige estos puertos desde la IP pública hacia el servidor Ubuntu GesPack APP:

| Puerto externo | IP interna del servidor | Puerto interno | Protocolo |
| -------------- | ----------------------- | -------------- | --------- |
| 80             | 192.168.70.X            | 80             | TCP       |
| 443            | 192.168.70.X            | 443            | TCP       |

### 1.2 Crear regla de firewall

Permitir conexiones entrantes a los puertos:

* TCP 80
* TCP 443
  Destino: IP del servidor Ubuntu

---

## 🔧 Paso 2: Instalar NGINX, Certbot y herramientas necesarias

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx apache2-utils certbot python3-certbot-nginx -y
```

---

## 🔨 Paso 3: Crear archivo de configuración para `gespack.parcelontime.es`

```bash
sudo nano /etc/nginx/sites-available/gespack
```

Pega esto dentro del archivo:

```nginx
server {
    listen 80;
    server_name gespack.parcelontime.es;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name gespack.parcelontime.es;

    ssl_certificate /etc/letsencrypt/live/gespack.parcelontime.es/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gespack.parcelontime.es/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        auth_basic "Restricted API";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://localhost:5050/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Guarda y cierra:

* Pulsa `Ctrl+O` → Enter para guardar
* Pulsa `Ctrl+X` para salir

---

## 🔨 Paso 4: Crear archivo para `docs.gespack.parcelontime.es`

```bash
sudo nano /etc/nginx/sites-available/gespack-docs
```

Pega esto:

```nginx
server {
    listen 80;
    server_name docs.gespack.parcelontime.es;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name docs.gespack.parcelontime.es;

    ssl_certificate /etc/letsencrypt/live/docs.gespack.parcelontime.es/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docs.gespack.parcelontime.es/privkey.pem;

    location / {
        auth_basic "GesPack Docs";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Guarda y cierra igual que antes (`Ctrl+O` → Enter, `Ctrl+X`)

---

## 🔧 Paso 5: Activar sitios en NGINX

```bash
sudo ln -s /etc/nginx/sites-available/gespack /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/gespack-docs /etc/nginx/sites-enabled/
```

Verifica que la configuración no tiene errores:

```bash
sudo nginx -t
```

Recarga NGINX:

```bash
sudo systemctl reload nginx
```

---

## 🔐 Paso 6: Crear usuario y contraseña para protección básica

```bash
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

Escribe una contraseña segura. Puedes añadir otros usuarios así:

```bash
sudo htpasswd /etc/nginx/.htpasswd otro_usuario
```

---

## 🔧 Paso 7: Generar certificados SSL con Certbot

```bash
# Frontend + API
sudo certbot --nginx -d gespack.parcelontime.es

# Docs
sudo certbot --nginx -d docs.gespack.parcelontime.es
```

Selecciona:

```
2: Redirigir todo el tráfico HTTP a HTTPS
```

---

## 🛡️ Paso 8: Abrir puertos 80 y 443 en el servidor Ubuntu

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 🔄 Paso 9: Comprobar si todo funciona

Desde cualquier navegador accede a:

* [https://gespack.parcelontime.es](https://gespack.parcelontime.es) → Frontend (React)
* [https://gespack.parcelontime.es/api](https://gespack.parcelontime.es/api) → Backend NestJS (te pedira usuario/contraseña)
* [https://docs.gespack.parcelontime.es](https://docs.gespack.parcelontime.es) → Documentación (protegida)

---

## 🔁 Paso 10: Comprobar renovación automática

```bash
sudo certbot renew --dry-run
```

Si no da errores, el sistema renovará solo antes de que caduque el certificado.

---
