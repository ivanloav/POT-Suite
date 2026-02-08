# ⚙️ Scripts de Automatización y Utilidades – GesPack

Esta carpeta contiene todos los scripts necesarios para automatizar tareas frecuentes de despliegue y arranque en local, tanto para desarrollo como para producción.

---

## 📁 ¿Qué encontrarás aquí?

| Script                           | Descripción                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------- |
| **`start-docker-backend.sh`**      | Arranca el contenedor Docker del backend en local (desarrollo).                                     |
| **`start-docker-db.sh`**           | Arranca el contenedor Docker de la base de datos en local (dev).                                    |
| **`deploy_GesPack_FrontEnd.sh`** | Despliega el frontend (React) en el servidor Ubuntu vía rsync y reinicia el contenedor Docker.      |
| **`deploy_GesPack_BackEnd.sh`**  | Despliega el backend (Node/NestJS) en el servidor Ubuntu vía rsync y reinicia el contenedor Docker. |
| ...                              | Puedes añadir aquí cualquier script de utilidad futura.                                             |

---

## 🚦 Cómo usar los scripts

1. **Personaliza variables** (usuario, host, paths) en cada script antes de ejecutarlo.
2. Todos los scripts están pensados para ejecutarse desde MacOS o Linux (terminal).
3. La autenticación con el servidor debe hacerse con clave SSH, nunca por contraseña manual.
4. **Haz los scripts ejecutables:**

   ```bash
   chmod +x *.sh
   ```
5. **Ejecuta desde la raíz del repo:**

   ```bash
   sh scripts/start-docker-backend.sh
   sh scripts/start-docker-db.sh
   sh scripts/deploy_GesPack_FrontEnd.sh
   sh scripts/deploy_GesPack_BackEnd.sh
   ```

---

## 🛡️ Buenas prácticas

* NO subas ficheros sensibles (.env, contraseñas) al repo.
* Documenta cualquier script nuevo añadiendo una línea en esta tabla.
* Si el script automatiza una tarea importante (deploy, limpieza, etc.), pon comentarios claros y pruebas de seguridad.
* Mantén todos los scripts organizados en esta carpeta para facilitar el mantenimiento.

---

## 🤝 Contribuciones

Si añades un script nuevo:

1. Explícalo en este README.
2. Usa nombres claros y en inglés (snake\_case si es posible).
3. Hazlo seguro: revisa rutas, permisos y operaciones críticas.

---

Cualquier duda o mejora, contacta con Iván ([ilopez@parcelontime.es](mailto:ilopez@parcelontime.es))
