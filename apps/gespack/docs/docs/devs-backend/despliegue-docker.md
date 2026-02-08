---
sidebar_position: 7
slug: /devs-backend/despliegue-docker
---

# Despliegue y Docker

GesPack utiliza Docker y docker-compose para facilitar el despliegue en cualquier entorno.

## Despliegue local
1. Clona el repositorio y accede a la carpeta raíz.
2. Ejecuta:

```bash
docker-compose up --build
```

Esto levantará el backend, frontend, base de datos y NGINX.

## Archivos clave
- `docker-compose.yml`: Orquesta todos los servicios.
- `backend/dockerfile`: Imagen del backend.
- `nginx/conf/`: Configuración del proxy y seguridad.

## Despliegue en producción
- Consulta los manuales en `docs/docs/Manual de Despliegue Automático GesPack Backend (Mac → Ubuntu).md` y `Frontend`.
- Configura variables de entorno y certificados SSL.

---

Siguiente: [Extensibilidad y nuevas features](./extensibilidad)
