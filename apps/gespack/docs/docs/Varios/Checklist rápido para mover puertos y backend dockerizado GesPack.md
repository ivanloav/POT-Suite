# 🚦 Checklist rápido para mover puertos y backend dockerizado GesPack

## 1. Decide el puerto final

* Elige un puerto abierto y permitido por la red/VPN (ejemplo: **3001**, 8080, etc).

---

## 2. Modifica el `docker-compose.yml` del backend

```yaml
ports:
  - "3001:5000"
```

*Asegúrate de reflejar el puerto final y el interno del backend.*

---

## 3. Actualiza el `.env` del frontend

```env
VITE_API_URL=http://192.168.50.14:3001
```

---

## 4. Actualiza el `.env` del backend (CORS)

```env
FRONTEND_URL=http://192.168.50.14:3000
```

*O añade más orígenes si accedes desde otros hosts/puertos.*

---

## 5. Abre el puerto en el firewall **solo** para la red necesaria

```bash
sudo ufw allow from 10.20.30.0/24 to any port 3001 proto tcp
```

*O ajusta el rango IP a tu VPN/LAN real.*

---

## 6. Reinicia los contenedores

```bash
docker compose down
docker compose up -d
```

---

## 7. Comprueba con curl desde LAN y VPN

```bash
curl -i http://192.168.50.14:3001/api/auth/login
```

*(Usa POST y los datos correctos para endpoints protegidos)*

---

## 8. Prueba en el navegador el frontend y backend

* Asegúrate de que las rutas, variables y CORS coinciden **exactamente** con los hosts y puertos usados.

---

## 9. Actualiza la documentación interna

* README, diagramas, scripts…
* Documenta los puertos y reglas activos para facilitar el mantenimiento futuro.

---

## 10. ¡Recuerda la seguridad!

* **No expongas puertos de backend a Internet** sin proxy ni HTTPS.
* Usa el firewall para limitar el acceso.
* Considera Nginx/Traefik si algún día abres a internet.

---
