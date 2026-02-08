# 🧠 La Biblia de Comandos macOS — Programador (IT Inventory / VMs / Docker)
_Estilo cheatsheet · explicación **línea a línea** (cada comando con su comentario)_

---

## 📁 Navegación

`ls`                         # Lista archivos y carpetas del directorio actual  
`ls -lah`                    # Lista detallada (permisos, dueño, tamaño humano) incluyendo ocultos  
`cd /ruta`                   # Cambia al directorio indicado  
`cd ~`                       # Va a tu carpeta HOME  
`cd -`                       # Vuelve al directorio anterior  
`pwd`                        # Muestra la ruta absoluta del directorio actual  
`tree`                       # Muestra la estructura de carpetas en forma de árbol (requiere instalar)  
`open .`                     # Abre en Finder la carpeta actual  
`open archivo.txt`           # Abre el archivo con la app por defecto  
`open -a "Visual Studio Code" .` # Abre la carpeta actual en VS Code  

---

## 🗂️ Gestión de archivos y carpetas

`touch file.txt`             # Crea un archivo vacío (o actualiza su fecha si existe)  
`mkdir carpeta`              # Crea un directorio  
`mkdir -p a/b/c`             # Crea directorios anidados sin error si ya existen  
`cp origen.txt destino.txt`  # Copia un archivo  
`cp -R carpetaA carpetaB`    # Copia una carpeta con todo su contenido  
`mv viejo.txt nuevo.txt`     # Renombra un archivo  
`mv archivo.txt carpeta/`    # Mueve un archivo a otra carpeta  
`rm archivo.txt`             # Elimina un archivo  
`rm -rf carpeta/`            # Elimina una carpeta y TODO lo que contiene (⚠️ irreversible)  
`rmdir carpeta`              # Elimina una carpeta vacía  

---

## 📖 Lectura y monitorización de archivos

`cat archivo.txt`            # Muestra el contenido completo del archivo  
`less archivo.txt`           # Visualiza paginado (q para salir, / para buscar)  
`head -n 50 archivo.txt`     # Muestra las primeras 50 líneas  
`tail -n 50 archivo.txt`     # Muestra las últimas 50 líneas  
`tail -f app.log`            # Sigue el archivo en tiempo real (logs)  
`wc -l archivo.txt`          # Cuenta líneas (útil para ficheros grandes)  

---

## 🔍 Búsqueda (archivos y texto)

`find . -name "*.ts"`        # Busca archivos por nombre (aquí: TypeScript) desde la carpeta actual  
`find . -type f -maxdepth 2` # Lista archivos hasta 2 niveles de profundidad  
`grep "ERROR" app.log`       # Busca texto exacto dentro de un archivo  
`grep -i "error" app.log`    # Busca ignorando mayúsculas/minúsculas  
`grep -r "JWT" .`            # Busca recursivo en todos los archivos desde la carpeta actual  
`mdfind "GesPack"`           # Busca con Spotlight desde terminal (rápido en macOS)  

---

## 🧬 Procesos y sistema

`ps aux`                     # Lista todos los procesos con detalle  
`top`                        # Monitor de procesos en tiempo real (macOS)  
`htop`                       # Monitor mejorado (si lo instalas con brew)  
`kill PID`                   # Termina un proceso por su ID  
`kill -9 PID`                # Fuerza el cierre (último recurso)  
`pkill -f "node"`            # Mata procesos que coinciden con el patrón (p.ej. node)  
`df -h`                      # Espacio de disco por partición (formato humano)  
`du -sh *`                   # Tamaño de cada archivo/carpeta en el directorio actual  
`uptime`                     # Tiempo encendido + carga del sistema  
`sw_vers`                    # Versión de macOS  

---

## 🌐 Red y puertos

`ifconfig`                   # Muestra interfaces de red y sus IPs (macOS)  
`ipconfig getifaddr en0`     # Devuelve la IP local (normalmente WiFi es en0)  
`lsof -i :3000`              # Qué proceso está usando el puerto 3000  
`netstat -an | grep 5432`    # Comprueba conexiones/escucha del puerto 5432 (Postgres)  
`curl -I https://example.com`# Pide sólo cabeceras HTTP (diagnóstico rápido)  
`curl -s http://localhost:3000/health` # Pide un endpoint sin “ruido” (modo silencioso)  
`ping -c 4 8.8.8.8`          # Comprueba conectividad con 4 paquetes  

---

## 🍺 Homebrew (imprescindible en macOS dev)

`brew update`                # Actualiza el índice de paquetes de Homebrew  
`brew upgrade`               # Actualiza paquetes instalados  
`brew install jq`            # Instala jq (JSON)  
`brew install htop`          # Instala htop (monitor procesos)  
`brew install tree`          # Instala tree (estructura carpetas)  
`brew list`                  # Lista paquetes instalados  
`brew info <paquete>`        # Información y opciones del paquete  

---

## 🔧 Git (día a día)

`git status`                 # Estado del repo (cambios pendientes)  
`git pull`                   # Trae cambios remotos y hace merge/rebase según config  
`git add .`                  # Añade todos los cambios al staging  
`git commit -m "mensaje"`    # Crea un commit  
`git push`                   # Sube commits al remoto  
`git log --oneline --graph --decorate --all` # Historial visual compacto  
`git diff`                   # Diferencias no añadidas al staging  
`git diff --staged`          # Diferencias ya en staging  
`git tag v1.2.3`             # Crea un tag (versión)  
`git push origin v1.2.3`     # Publica el tag en remoto  

---

# 🔐 SSH (tus VMs: App y DB)

`ssh gespack-app`            # Entra por SSH a la VM donde corre la App (Docker)  
`ssh gespack-db`             # Entra por SSH a la VM donde corre la DB (Docker)  

`ssh gespack-app "uname -a"` # Ejecuta un comando remoto sin entrar en sesión interactiva  
`ssh gespack-db "docker ps"` # Lanza docker ps en la VM DB directamente desde tu Mac  

`scp file.txt gespack-app:/home/ivan/`      # Copia un archivo a la VM App  
`scp -r carpeta/ gespack-app:/home/ivan/`   # Copia una carpeta completa a la VM App  

`rsync -av --progress ./backend/ gespack-app:/home/ivan/backend/` # Sincroniza carpeta (deploy rápido)  
`rsync -av --delete ./frontend/ gespack-app:/home/ivan/frontend/` # Sincroniza y borra sobrantes en destino (⚠️ cuidado)  

## 🔁 Túneles SSH (muy útil para Postgres y paneles)
`ssh -L 5432:localhost:5432 gespack-db`     # Expone Postgres remoto como localhost:5432 en tu Mac  
`ssh -L 3000:localhost:3000 gespack-app`    # Expone la app remota como localhost:3000 en tu Mac  

---

# 🐳 DOCKER (comandos base) — con explicación línea a línea

## 📌 Información y estado

`docker version`             # Muestra versión del cliente y del engine  
`docker info`                # Resumen del daemon (storage driver, cgroups, etc.)  
`docker ps`                  # Lista contenedores en ejecución  
`docker ps -a`               # Lista todos (incluye parados)  
`docker images`              # Lista imágenes locales  
`docker volume ls`           # Lista volúmenes (datos persistentes)  
`docker network ls`          # Lista redes Docker  

## ▶️ Arrancar / parar / reiniciar

`docker start <container>`   # Arranca un contenedor existente (parado)  
`docker stop <container>`    # Para un contenedor (shutdown limpio)  
`docker restart <container>` # Reinicia (stop + start) el contenedor  

## 🧹 Borrar contenedores

`docker rm <container>`      # Elimina un contenedor parado  
`docker rm -f <container>`   # Fuerza eliminación aunque esté corriendo  

## 🧾 Logs y diagnóstico

`docker logs <container>`                # Muestra logs del contenedor  
`docker logs -f <container>`             # Sigue logs en tiempo real  
`docker logs -f --tail 200 <container>`  # Sigue logs empezando por las últimas 200 líneas  

## 🧠 Entrar dentro de un contenedor

`docker exec -it <container> sh`         # Abre una shell (sh) dentro del contenedor  
`docker exec -it <container> bash`       # Abre bash si existe (no siempre está instalado)  

## 📊 Recursos

`docker stats`               # Monitor de CPU/RAM por contenedor (en vivo)  
`docker stats --no-stream`   # Muestra una vez y sale (útil por SSH)  

## 🧽 Limpieza (cuidado)

`docker system df`           # Muestra cuánto ocupa Docker (imágenes/volúmenes/cache)  
`docker system prune`        # Limpia contenedores/imagenes no usadas (conservador)  
`docker system prune -a`     # Limpia TODO lo no usado (⚠️ agresivo)  
`docker volume prune`        # Borra volúmenes no usados (⚠️ puede borrar datos si no están en uso)  

---

# 🧩 DOCKER COMPOSE (tu operativa real)

## ✅ Levantar / bajar

`docker compose up -d`              # Arranca servicios en segundo plano  
`docker compose down`               # Para y elimina contenedores/redes creadas por compose  
`docker compose down -v`            # También elimina volúmenes (⚠️ adiós datos de DB si viven ahí)  

## 📌 Estado y logs

`docker compose ps`                 # Estado de servicios del compose  
`docker compose logs -f`            # Logs de todos los servicios en vivo  
`docker compose logs -f --tail 200` # Logs empezando por las últimas 200 líneas  
`docker compose logs -f app`        # Logs sólo del servicio “app”  
`docker compose logs -f db`         # Logs sólo del servicio “db”  

## 🔁 Rebuild y reinicio

`docker compose build`              # Construye imágenes definidas en compose  
`docker compose up -d --build`      # Reconstruye y arranca (típico tras cambios)  
`docker compose restart app`        # Reinicia sólo el servicio app  
`docker compose restart db`         # Reinicia sólo el servicio db  

## 🧠 Ejecutar comandos dentro de un servicio

`docker compose exec app sh`        # Entra al contenedor del servicio app  
`docker compose exec app node -v`   # Ejecuta node -v dentro del contenedor app  
`docker compose exec db psql -U postgres` # Entra a psql dentro del contenedor db  

---

# 🐘 PostgreSQL (si está en Docker) — básico práctico

`docker exec -it postgres psql -U postgres`           # Abre psql dentro del contenedor postgres  
`docker exec -it postgres psql -U postgres -d GesPack`# Abre la DB GesPack  

`docker exec -t postgres pg_dump -U postgres GesPack > backup.sql` # Backup SQL (sale a tu VM)  
`cat backup.sql | docker exec -i postgres psql -U postgres GesPack` # Restore desde backup.sql  

---

# 🌍 NGINX (en Docker) — muy típico en producción

`docker ps | grep nginx`                         # Comprueba si nginx está corriendo  
`docker logs -f --tail 200 nginx`                # Logs del contenedor nginx  
`docker exec -it nginx nginx -t`                 # Valida configuración (si hay error te lo dice)  
`docker exec -it nginx nginx -s reload`          # Recarga configuración sin reiniciar contenedor  
`docker exec -it nginx cat /etc/nginx/nginx.conf`# Ver config principal dentro del contenedor  

---

# 🔐 HTTPS / Certificados (Let’s Encrypt / Certbot) — enfoque práctico

## Si usas Certbot en contenedor o VM (depende de tu setup)

`openssl x509 -in fullchain.pem -noout -dates`   # Ver fechas de validez del certificado  
`openssl x509 -in fullchain.pem -noout -issuer`  # Ver emisor del certificado  
`openssl x509 -in fullchain.pem -noout -subject` # Ver a qué dominio aplica  

## Comprobar desde tu Mac qué certificado está sirviendo tu dominio

`openssl s_client -connect gespack.parcelontime.es:443 -servername gespack.parcelontime.es < /dev/null | openssl x509 -noout -dates`  
# Comprueba validez real en remoto (lo que ve el cliente)

---

# 🚀 Deploy remoto (VM App) — comandos que usarías a diario

`ssh gespack-app "cd /home/ivan/gespack && git pull"`                   # Actualiza código en VM App  
`ssh gespack-app "cd /home/ivan/gespack && docker compose up -d --build"`# Reconstruye y levanta servicios  
`ssh gespack-app "cd /home/ivan/gespack && docker compose logs -f app"`  # Mira logs del backend/app  

---

# ⚡ Atajos de terminal (productividad)

`CTRL + R`                   # Busca en historial de comandos  
`!!`                         # Repite el último comando  
`history | tail -n 30`        # Ver últimos 30 comandos del historial  
`comando | pbcopy`           # Copia salida al portapapeles (macOS)  
`pbpaste`                    # Pega lo que hay en portapapeles en la terminal  

---