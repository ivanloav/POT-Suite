#!/bin/bash

REMOTE_USER="ivan"
REMOTE_HOST="192.168.50.14"
SSH_KEY="/Users/ivan/.ssh/id_ed25519"

# Seguridad: fallar ante errores en este host
set -e

# 🛑 Parar y limpiar remoto (no borra imágenes en uso)
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
set -e
cd /home/ivan/gespack-app || exit 1
echo "🛑 Parando y eliminando contenedores antiguos..."
docker compose down --remove-orphans || true
docker system prune -f || true

# Crear red externa si no existe
if ! docker network inspect shared-network >/dev/null 2>&1; then
  echo "🌐 Creando red externa 'shared-network'..."
  docker network create --driver bridge shared-network
else
  echo "🌐 Red 'shared-network' ya existe."
fi
EOF

########## NGINX + HTTPS ##########
echo "\n🚀 DEPLOY: NGINX + HTTPS"
LOCAL_PATH="/Users/ivan/Documents/VSCode-POT/GesPack/nginx"
REMOTE_PATH="/home/ivan/gespack-app/nginx"
[ -d "$LOCAL_PATH" ] || { echo "❌ $LOCAL_PATH no existe"; exit 1; }

# No tocar certbot/conf (lo maneja certbot con permisos root)
rsync -avz --delete \
  --exclude "certbot/conf/**" --exclude "*.sh" --exclude ".env" \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_PATH/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# Levantar nginx SIEMPRE; certbot es best-effort
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << 'EOF'
set -e
cd /home/ivan/gespack-app

# Asegurar que no hay nginx del sistema ocupando 80/443
if systemctl is-active --quiet nginx; then
  echo "🧹 Parando nginx del sistema..."
  sudo systemctl stop nginx || true
  sudo systemctl disable nginx || true
fi

echo "🔧 Build nginx y levantar en HTTP"
docker compose build nginx
docker compose up -d nginx

# Intentar certbot pero sin romper el despliegue si falla
set +e
docker compose run --rm certbot
CERTBOT_EXIT=$?
set -e

if [ "$CERTBOT_EXIT" -eq 0 ]; then
  echo "🔐 Certbot OK → reinicio nginx (HTTPS habilitado)"
  docker compose restart nginx
else
  echo "⚠️ Certbot falló (exit=$CERTBOT_EXIT). Se queda en HTTP. Reintenta cuando el 80 público apunte aquí."
fi
EOF

echo "✅ NGINX + HTTPS desplegado correctamente."

# Fin
