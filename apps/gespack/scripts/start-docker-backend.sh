#!/bin/bash

# Verifica si Docker está en funcionamiento
if ! docker info > /dev/null 2>&1; then
  echo "Docker no está en ejecución. Iniciando Docker Desktop..."
  open --background -a Docker

  # Espera hasta que Docker esté listo
  while ! docker info > /dev/null 2>&1; do
    sleep 1
  done
fi

# Inicia el contenedor o créalo si no existe
# docker start GesPack || docker run -d --name GesPack postgres
docker start GesPack-DB || docker-compose up -d

# Inicia la aplicación en modo desarrollo
nest start --watch
