# 🚀 GesPack – Configuración completa NGINX + HTTPS + Seguridad

Este documento configura:

* ✅ Frontend: [https://gespack.parcelontime.es](https://gespack.parcelontime.es)
* ✅ API: [https://gespack.parcelontime.es/api](https://gespack.parcelontime.es/api)
* ✅ Docs: [https://docs.gespack.parcelontime.es](https://docs.gespack.parcelontime.es)
* 🔐 HTTPS con Let's Encrypt
* 🔐 Protección por contraseña básica (auth\_basic)

> ⚠️ Nota: HTTPS cifra la conexión. La columna "Protegido" se refiere a si la URL requiere usuario/contraseña mediante NGINX (auth\_basic).

---

## 🌐 NGINX – Configuración de dominios y subdominios

### 🔹 Dominio principal: `gespack.parcelontime.es` (Frontend + API)

#### HTTP → Redirección a HTTPS

```nginx
server {
    listen 80;
    server_name gespack.parcelontime.es;
    return 301 https://$host$request_uri;
}
```

#### HTTPS + Frontend + API protegida

```nginx
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

---

### 🔸 Subdominio: `docs.gespack.parcelontime.es` (Docusaurus)

#### HTTP → Redirección a HTTPS

```nginx
server {
    listen 80;
    server_name docs.gespack.parcelontime.es;
    return 301 https://$host$request_uri;
}
```

#### HTTPS + Docs protegidos

```nginx
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

---

## 🧰 Comandos para activarlo

### Habilitar sitios

```bash
sudo ln -s /etc/nginx/sites-available/gespack /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/gespack-docs /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Instalar Certbot + SSL

```bash
sudo apt install certbot python3-certbot-nginx -y

# Para frontend + API
sudo certbot --nginx -d gespack.parcelontime.es

# Para docs
sudo certbot --nginx -d docs.gespack.parcelontime.es
```

### Comprobar renovación automática

```bash
sudo certbot renew --dry-run
```

---

## 🔐 Protección con contraseña básica

### Instalar herramientas y crear usuario

```bash
sudo apt install apache2-utils -y
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

> Para más usuarios, repite sin `-c`

---

## ✅ Resultado final esperado

| URL                                                                          | Servicio          | Protegido (auth\_basic) | Puerto contenedor |
| ---------------------------------------------------------------------------- | ----------------- | ----------------------- | ----------------- |
| [https://gespack.parcelontime.es](https://gespack.parcelontime.es)           | Frontend (React)  | ❌ No                    | 3000              |
| [https://gespack.parcelontime.es/api](https://gespack.parcelontime.es/api)   | API (NestJS)      | ✅ Sí                    | 5050              |
| [https://docs.gespack.parcelontime.es](https://docs.gespack.parcelontime.es) | Docusaurus (Docs) | ✅ Sí                    | 3001              |

---
