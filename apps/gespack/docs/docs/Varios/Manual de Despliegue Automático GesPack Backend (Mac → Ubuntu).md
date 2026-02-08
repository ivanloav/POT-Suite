# 🚀 Manual de Despliegue Automático GesPack Backend (Mac → Ubuntu)

---

## 1. Objetivo

Desplegar el backend de GesPack desde un Mac a un servidor Ubuntu **de forma automática y segura** mediante un script bash, sincronizando los archivos vía `rsync` y reiniciando el contenedor Docker remoto.

---

## 2. Preparativos

### a) SSH sin contraseña

1. **Generar clave SSH en el Mac** (si no la tienes ya)

   ```bash
   ssh-keygen -t ed25519 -C "deploy@gespack"
   ```
2. **Copiar la clave pública al servidor Ubuntu**

   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub ivan@192.168.50.14
   ```
3. **Probar acceso SSH sin contraseña**

   ```bash
   ssh -i ~/.ssh/id_ed25519 ivan@192.168.50.14
   ```

---

## 3. Script de despliegue en Mac (`deploy_GesPack_BackEnd.sh`)

```bash
#!/bin/bash

LOCAL_PATH="/Users/ivan/Documents/VSCode-POT/GesPack/GesPack-BackEnd"
REMOTE_USER="ivan"
REMOTE_HOST="192.168.50.14"
REMOTE_PATH="/home/ivan/gespack-app/backend"
SSH_KEY="/Users/ivan/.ssh/id_ed25519"

# Rsync usando la clave
rsync -avz --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "deploy_GesPack_BackEnd.sh" \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_PATH/" \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# SSH usando la clave y asegurando permisos de ejecución
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_PATH && chmod +x ./deploy_GesPack_BackEnd.sh && ./deploy_GesPack_BackEnd.sh"
```

* **Haz ejecutable el script:**

  ```bash
  chmod +x deploy_GesPack_BackEnd.sh
  ```

---

## 4. Script remoto en Ubuntu (`deploy_GesPack_BackEnd.sh`)

```bash
#!/bin/bash
set -e
cd /home/ivan/gespack-app/backend
docker compose down
docker compose up -d --build
echo "✅ Backend desplegado correctamente a las $(date)"
```

* **Haz ejecutable el script en el servidor:**

  ```bash
  chmod +x /home/ivan/gespack-app/backend/deploy_GesPack_BackEnd.sh
  ```

---

## 5. ¿Cómo usarlo?

Cada vez que quieras desplegar la última versión del backend:

```bash
sh deploy_GesPack_BackEnd.sh
```

---

## 6. Consejos y mejoras

* Si `rsync` sobrescribe el script remoto, el comando `chmod +x` en el SSH **garantiza siempre los permisos**.
* Puedes añadir exclusiones, pasos para migraciones o logs según tus necesidades.
* Personaliza rutas/nombres según tus carpetas reales.
* Para el frontend, crea un script similar cambiando los paths.

---

## 7. Solución de problemas

* **Permission denied**: Asegúrate de que la clave está bien, el usuario existe y los permisos son correctos.
* **No se sincronizan archivos**: Revisa las rutas y exclusiones de `rsync`.
* **Docker no se reinicia**: Comprueba que el usuario tiene permisos para manejar Docker.

---

## 8. Seguridad

* Las claves SSH deben ser seguras y solo accesibles por el usuario.
* El acceso por password debe estar deshabilitado si es posible.

---

## 9. Ventajas de este método

* Despliegue ultra rápido, fiable y seguro.
* Nada expuesto a Internet salvo SSH, y solo para tu IP.
* Muy fácil de mantener y adaptar para otros proyectos.
