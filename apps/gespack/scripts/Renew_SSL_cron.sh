#!/bin/bash

# 🔧 Script que instala una tarea CRON para renovar certificados SSL de GesPack
# Ejecutar una vez en el servidor Ubuntu para dejar la tarea programada

CRON_LINE="15 3 */60 * * docker compose -f /home/ivan/gespack-app/docker-compose.yml run --rm certbot && docker compose -f /home/ivan/gespack-app/docker-compose.yml exec nginx nginx -s reload"

# ✅ Comprobar si la entrada ya existe
(crontab -l 2>/dev/null | grep -F "$CRON_LINE") && {
  echo "✅ La tarea cron ya existe. Nada que hacer."
  exit 0
}

# ➕ Añadir la tarea al crontab si no existe
(crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -

echo "✅ Tarea CRON para renovar certificados SSL instalada con éxito."

# Fin
# Nota: Este script debe ejecutarse con permisos de usuario que tenga acceso a crontab.