#!/bin/bash

# 🔧 Script para renovar certificados SSL con Certbot desde Mac (solo certbot)
# Ejecutar desde tu Mac si solo necesitas renovar el certificado HTTPS de GesPack

# ⚖️ Variables de configuración
REMOTE_USER="ivan"
REMOTE_HOST="192.168.50.14"
SSH_KEY="/Users/ivan/.ssh/id_ed25519"

# 🚀 Ejecutar Certbot y reiniciar NGINX
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << EOF
cd /home/ivan/gespack-app

echo "📜 Renovando certificados SSL..."
docker compose run --rm certbot

sleep 2

echo "🔁 Reiniciando nginx para aplicar certificados nuevos..."
docker compose exec nginx nginx -s reload
EOF

echo "✅ Certificados SSL renovados correctamente."

# Fin
